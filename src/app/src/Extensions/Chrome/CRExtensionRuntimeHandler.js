import { webContents, ipcMain } from 'electron'
import fs from 'fs-extra'
import { URL } from 'url'
import os from 'os'
import CRDispatchManager from './CRDispatchManager'
import CRExtensionRuntime from './CRExtensionRuntime'
import CRExtensionMatchPatterns from 'shared/Models/CRExtension/CRExtensionMatchPatterns'
import { EventEmitter } from 'events'
import {
  CR_EXTENSION_PROTOCOL,
  CR_CONTENT_SCRIPT_XHR_ACCEPT_PREFIX,
  CR_NATIVE_HOOK_EXTENSIONS,
  CR_CONTENT_SCRIPT_START_CONTEXT
} from 'shared/extensionApis'
import {
  CRX_RUNTIME_CONTENTSCRIPT_PROVISION_CONTEXT_SYNC,
  CRX_RUNTIME_CONTENTSCRIPT_BENCHMARK_CONFIG_SYNC,
  CRX_RUNTIME_CONTENTSCRIPT_PROVISIONED,
  CRX_RUNTIME_SENDMESSAGE,
  CRX_TABS_SENDMESSAGE,
  CRX_RUNTIME_ONMESSAGE_,
  CRX_RUNTIME_HAS_RESPONDER,
  CRX_PORT_CONNECT_SYNC,
  CRX_PORT_CONNECTED_,
  CRX_PORT_DISCONNECTED_
} from 'shared/crExtensionIpcEvents'
import { CSPParser, CSPBuilder } from './CSP'
import pathTool from 'shared/pathTool'
import CRExtensionTab from './CRExtensionRuntime/CRExtensionTab'
import mime from 'mime'
import { ElectronWebContents } from 'ElectronTools'
import WaveboxWindow from 'Windows/WaveboxWindow'

const privNextPortId = Symbol('privNextPortId')
const privPreflightXHRRequests = Symbol('privPreflightXHRRequests')
const privOpenXHRRequests = Symbol('privOpenXHRRequests')
const privCSContexts = Symbol('privCSContexts')

class CRExtensionRuntimeHandler extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()
    this.runtimes = new Map()
    this[privNextPortId] = 0
    this[privPreflightXHRRequests] = new Map()
    this[privOpenXHRRequests] = new Map()
    this[privCSContexts] = new Map()

    CRDispatchManager.registerHandler(CRX_RUNTIME_SENDMESSAGE, this._handleRuntimeSendmessage)
    CRDispatchManager.registerHandler(CRX_TABS_SENDMESSAGE, this._handleTabsSendmessage)

    ipcMain.on(CRX_RUNTIME_CONTENTSCRIPT_PROVISION_CONTEXT_SYNC, this._handleProvisionContentScriptContextSync)
    ipcMain.on(CRX_RUNTIME_CONTENTSCRIPT_BENCHMARK_CONFIG_SYNC, this._handleContentScriptBenchmarkConfigSync)
    ipcMain.on(CRX_RUNTIME_HAS_RESPONDER, this._handleHasRuntimeResponder)
    ipcMain.on(CRX_PORT_CONNECT_SYNC, this._handlePortConnect)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get allRuntimes () { return Array.from(this.runtimes.values()) }
  get inUsePartitions () {
    return this.allRuntimes
      .map((runtime) => {
        return runtime.extension.manifest.hasBackground
          ? runtime.backgroundPage.partitionId
          : undefined
      })
      .filter((p) => !!p)
  }

  /* ****************************************************************************/
  // Extension Setup
  /* ****************************************************************************/

  /**
  * Starts an extension
  * @param extension: the extension to start
  */
  startExtension (extension) {
    if (this.runtimes.has(extension.id)) { return }
    this.runtimes.set(extension.id, new CRExtensionRuntime(extension))
    this.emit('extension-started', extension.id, extension, this.runtimes.get(extension.id))
  }

  /**
  * Binds the interceptor for session load requests
  * @param protocol: the protocol to start responding on
  */
  registerForSessionLoadRequests (protocol) {
    protocol.interceptBufferProtocol(CR_EXTENSION_PROTOCOL, this._handleChromeExtensionBufferRequest)
  }

  /* ****************************************************************************/
  // Extension Teardown
  /* ****************************************************************************/

  /**
  * Stops an extension
  * @param extension: the extension to stop
  */
  stopExtension (extension) {
    if (!this.runtimes.has(extension.id)) { return }
    this.runtimes.get(extension.id).destroy()
    this.runtimes.delete(extension.id)
    this.emit('extension-stopped', extension.id, extension)
  }

  /* ****************************************************************************/
  // Extension Resources
  /* ****************************************************************************/

  /**
  * Handles a chrome extension buffer request
  * @param request: the request that was made
  * @param responder: the responder to return the response
  */
  _handleChromeExtensionBufferRequest = (request, responder) => {
    const purl = new URL(decodeURIComponent(request.url || 'about:blank'))
    if (!purl.hostname || !purl.pathname) { return responder() }

    const extensionId = purl.hostname
    const runtime = this.runtimes.get(extensionId)
    if (!runtime) { return responder() }

    // Serve the background page
    if (runtime && runtime.backgroundPage.isRunning && purl.pathname === `/${runtime.backgroundPage.name}`) {
      return responder({
        mimeType: 'text/html',
        data: runtime.backgroundPage.html
      })
    }

    // Lastpass native hook
    if (extensionId === CR_NATIVE_HOOK_EXTENSIONS.LASTPASS) {
      const waveboxConfig = runtime.extension.manifest.wavebox
      if (waveboxConfig.getNativeHook('enableBAPopoutOnCSPopout', false) === true) {
        if (waveboxConfig.getNativeHook('csPopoutPaths', []).includes(purl.pathname)) {
          setTimeout(() => {
            const focusedTabId = WaveboxWindow.focusedTabId()
            if (focusedTabId) {
              webContents.fromId(focusedTabId).executeJavaScript('document.activeElement.blur()')
              runtime.browserAction.browserActionClicked(focusedTabId)
            }
          })
          return responder(-6)
        }
      }

      if (waveboxConfig.getNativeHook('blockResources', []).includes(purl.pathname)) {
        return responder(-6)
      }
    }

    // Serve the asset/file
    const scopedPath = pathTool.scopeToDir(runtime.extension.srcPath, purl.pathname)
    if (scopedPath) {
      fs.readFile(scopedPath)
        .then((data) => {
          const mimeType = mime.getType(scopedPath)
          if (mimeType) {
            responder({
              mimeType: mimeType,
              data: data
            })
          } else {
            responder(data)
          }
        })
        .catch(() => { responder(-6) }) // not found
    } else {
      responder(-6) // not found
    }
  }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Handles a content script requesting a new context
  * @param evt: the event that fired
  */
  _handleProvisionContentScriptContextSync = (evt) => {
    const id = evt.sender.id
    if (this[privCSContexts].has(id)) {
      this[privCSContexts].set(id, this[privCSContexts].get(id) + 1)
    } else {
      this[privCSContexts].set(id, CR_CONTENT_SCRIPT_START_CONTEXT)
      evt.sender.once('destroyed', () => {
        this[privCSContexts].delete(id)
      })
    }
    const contextId = this[privCSContexts].get(id)
    Array.from(this.runtimes.values()).forEach((runtime) => {
      runtime.backgroundPage.sendToWebContents(CRX_RUNTIME_CONTENTSCRIPT_PROVISIONED, id, contextId)
    })

    // Re-queue for everyone to finish
    setTimeout(() => {
      evt.returnValue = contextId
    }, 500)
  }

  /**
  * Gets the content script benchmarking config
  * @param evt: the event that fired
  */
  _handleContentScriptBenchmarkConfigSync = (evt) => {
    evt.returnValue = {
      cscripts: this[privCSContexts].size,
      runtimes: this.runtimes.size,
      cpus: os.cpus().length
    }
  }

  /**
  * Handles a runtime message
  * @param evt: the event that fired
  * @param [extensionId, message]: the id of the extension to send the message to and the message
  * @param responseCallback: callback to execute with response
  */
  _handleRuntimeSendmessage = (evt, [extensionId, message], responseCallback) => {
    const runtime = this.runtimes.get(extensionId)
    if (!runtime || !runtime.backgroundPage.isRunning) {
      responseCallback(new Error(`Could not find extension ${extensionId}`))
      return
    }

    CRDispatchManager.requestAllOnTarget(
      runtime.backgroundPage.webContents,
      `${CRX_RUNTIME_ONMESSAGE_}${extensionId}`,
      [
        extensionId,
        {
          tabId: evt.sender.id,
          tab: CRExtensionTab.dataFromWebContents(runtime.extension, evt.sender),
          url: evt.sender.getURL()
        },
        message
      ],
      (evt, err, response) => {
        responseCallback(err, response)
      }
    )
  }

  /**
  * Handles a message send to a specifc tab
  * @param evt: the event that fired
  * @param [extensionId, tabId, isBackgroundPage, message]: the extension and tab to send to along with the message to pass
  * @param responseCallback: callback to execute with response
  */
  _handleTabsSendmessage = (evt, [extensionId, tabId, isBackgroundPage, message], responseCallback) => {
    const runtime = this.runtimes.get(extensionId)
    if (!runtime) {
      responseCallback(new Error(`Could not find extension ${extensionId}`))
      return
    }
    const targetWebcontents = webContents.fromId(tabId)
    if (!targetWebcontents) {
      responseCallback(new Error(`Could not find tab ${tabId}`))
      return
    }

    CRDispatchManager.requestAllOnTarget(
      targetWebcontents,
      `${CRX_RUNTIME_ONMESSAGE_}${extensionId}`,
      [
        extensionId,
        {
          tabId: evt.sender.id,
          tab: isBackgroundPage ? null : CRExtensionTab.dataFromWebContents(runtime.extension, evt.sender),
          url: isBackgroundPage ? undefined : evt.sender.getURL()
        },
        message
      ],
      (evt, err, response) => {
        responseCallback(err, response)
      }
    )
  }

  /**
  * Checks to see if there is a runtime responder
  * @param evt: the event that fired
  * @param extensionId: the id of the extension
  */
  _handleHasRuntimeResponder = (evt, extensionId) => {
    try {
      evt.returnValue = this.runtimes.has(extensionId)
    } catch (ex) {
      console.error(`Failed to respond to "${CRX_RUNTIME_HAS_RESPONDER}" continuing with unkown side effects`, ex)
      evt.returnValue = false
    }
  }

  /**
  * Sets up a port connection
  * @Param evt: the event that fired
  * @Param
  */
  _handlePortConnect = (evt, extensionId, connectInfo) => {
    try {
      const runtime = this.runtimes.get(extensionId)
      if (!runtime) {
        evt.returnValue = null
        return
      }

      if (!runtime.backgroundPage || !runtime.backgroundPage.isRunning) {
        evt.returnValue = null
        return
      }

      const backgroundContents = runtime.backgroundPage.webContents
      const portId = this[privNextPortId]++
      evt.returnValue = {
        portId: portId,
        connectedParty: {
          tabId: backgroundContents.id
        }
      }

      // Prepare for teardown
      evt.sender.once('render-view-deleted', () => {
        if (runtime && runtime.backgroundPage && runtime.backgroundPage.isRunning) {
          runtime.backgroundPage.webContents.send(`${CRX_PORT_DISCONNECTED_}${portId}`)
        }
      })

      // Emit the connect event
      runtime.backgroundPage.webContents.send(
        `${CRX_PORT_CONNECTED_}${extensionId}`,
        portId,
        {
          tabId: evt.sender.id,
          tab: CRExtensionTab.dataFromWebContents(runtime.extension, evt.sender),
          url: evt.sender.getURL()
        },
        connectInfo
      )
    } catch (ex) {
      console.error(`Failed to respond to "${CRX_PORT_CONNECT_SYNC}" continuing with unkown side effects`, ex)
      evt.returnValue = null
    }
  }

  /* ****************************************************************************/
  // Data getters
  /* ****************************************************************************/

  /**
  * Gets the runtime data in a synchronous way
  */
  getRuntimeData () {
    const data = Array.from(this.runtimes.keys())
      .reduce((acc, key) => {
        acc[key] = this.runtimes.get(key).buildUIRuntimeData()
        return acc
      }, {})
    return data
  }

  /**
  * Gets the context menu runtime data in a synchronous way
  * @return an object-map of UI data for rendering the context menu
  */
  getRuntimeContextMenuData () {
    return Array.from(this.runtimes.keys())
      .reduce((acc, key) => {
        acc[key] = this.runtimes.get(key).buildUIRuntimeContextMenuData()
        return acc
      }, {})
  }

  /**
  * Gets all the content script guest configs
  * @return an array of guest configs
  */
  getAllContentScriptGuestConfigs () {
    return Array.from(this.runtimes.values())
      .map((runtime) => runtime.contentScript.guestConfig)
      .filter((c) => !!c)
  }

  /*
  * Gets the guest config for an extension
  * @param extensionId: the id of the extension
  * @return the guest config or undefined
  */
  getContentScriptRuntimeConfig (extensionId) {
    const runtime = this.runtimes.get(extensionId)
    if (!runtime) { return undefined }
    return runtime.contentScript.runtimeConfig
  }

  /**
  * @param extensionId: the id of the extension
  * @return true if there is a runtime
  */
  hasRuntime (extensionId) {
    return this.runtimes.has(extensionId)
  }

  /**
  * @param extensionId: the id of the extension
  * @return the webcontents id or undefined
  */
  getBackgroundPageId (extensionId) {
    const runtime = this.runtimes.get(extensionId)
    if (!runtime) { return undefined }
    return runtime.backgroundPage.webContentsId
  }

  /* ****************************************************************************/
  // Options
  /* ****************************************************************************/

  /**
  * Opens the options page
  * @param extensionId: the id of the extension
  */
  openOptionsPage (extensionId) {
    const runtime = this.runtimes.get(extensionId)
    if (!runtime) { return }
    runtime.backgroundPage.launchOptions()
  }

  /**
  * Opens the inspector for the background page
  * @param extensionId: the id of the extension
  */
  inspectBackgroundPage (extensionId) {
    const runtime = this.runtimes.get(extensionId)
    if (!runtime) { return }
    runtime.backgroundPage.openDevTools()
  }

  /* ****************************************************************************/
  // Data Manaement
  /* ****************************************************************************/

  /**
  * Clears all the browser sessions
  */
  clearAllBrowserSessions () {
    Array.from(this.runtimes.values()).forEach((runtime) => {
      runtime.backgroundPage.clearBrowserSession()
    })
  }

  /* ****************************************************************************/
  // Window open
  /* ****************************************************************************/

  /**
  * Checks to see if a window should open as a popout
  * @param webContentsId: the id of the webcontents
  * @param url: the url to open with
  * @param parsedUrl: the parsed url
  * @param disposition: the open mode disposition
  * @return {mode, extension} to open in, or false if nothing matched
  */
  getWindowPopoutModePreference (webContentsId, url, parsedUrl, disposition) {
    const runtimes = Array.from(this.runtimes.values())
    for (let i = 0; i < runtimes.length; i++) {
      const mode = runtimes[i].getWindowPopoutModePreference(webContentsId, url, parsedUrl, disposition)
      if (mode !== false) { return mode }
    }
    return false
  }

  /* ****************************************************************************/
  // Actioning
  /* ****************************************************************************/

  /**
  * Handles a context menu item being selected
  * @param extensionId: the id of the extension to dispatch to
  * @param contents: the contents that's dispatching
  * @param params: the click params
  */
  contextMenuItemSelected (extensionId, contents, params) {
    const runtime = this.runtimes.get(extensionId)
    if (!runtime || !runtime.contextMenus) { return }
    runtime.contextMenus.itemSelected(contents, params)
  }

  /* ****************************************************************************/
  // CSP
  /* ****************************************************************************/

  /**
  * Updates the CSP headers for the given request url
  * @param requestUrl: the url the request was made on
  * @param responseHeaders: the original response headers created by the server
  * @return undefined or the updated response headers
  */
  updateContentSecurityPolicy (requestUrl, responseHeaders) {
    if (!responseHeaders['content-security-policy']) { return undefined }

    // Look to see if any extensions wnat to modify this
    const purl = new URL(requestUrl || 'about:blank')
    const matchingRuntimes = Array.from(this.runtimes.values()).filter((runtime) => {
      const manifest = runtime.extension.manifest
      if (!manifest.wavebox.hasContentSecurityPolicy) { return false }

      const matches = CRExtensionMatchPatterns.matchUrls(
        purl.protocol,
        purl.hostname,
        purl.pathname,
        manifest.wavebox.contentSecurityPolicy.matches
      )
      if (!matches) { return false }

      return true
    })
    if (!matchingRuntimes.length) { return undefined }

    // Parse and update the incoming headers
    const responseCSPs = responseHeaders['content-security-policy'].map((csp) => CSPParser(csp))
    matchingRuntimes.forEach((runtime) => {
      const directives = runtime.extension.manifest.wavebox.contentSecurityPolicy.directives
      responseCSPs.forEach((responseCSP) => {
        Object.keys(directives).forEach((k) => {
          if (responseCSP[k] !== undefined) {
            responseCSP[k] = responseCSP[k].concat(directives[k])
          }
        })
      })
    })

    // Write back
    responseHeaders['content-security-policy'] = responseCSPs.map((csp) => {
      return CSPBuilder({ directives: csp })
    })
    return responseHeaders
  }

  /* ****************************************************************************/
  // XHR
  /* ****************************************************************************/

  /**
  * Extracts the accept header
  * @param requestHeaders: the request headers
  * @return { acceptHeader, extensionId, xhrToken } the new accept header, the extensionId and the xhrToken
  */
  _extractCSXHRAcceptHeader (requestHeaders) {
    const prevAccept = requestHeaders['Accept']
    if (prevAccept === undefined) { return {} }
    if (prevAccept.indexOf(CR_CONTENT_SCRIPT_XHR_ACCEPT_PREFIX) === -1) { return { acceptHeader: prevAccept } }

    // Extract the accept header
    let extensionAccept
    const nextAccept = prevAccept
      .split(',')
      .map((a) => a.trim())
      .filter((a) => {
        if (a.startsWith(CR_CONTENT_SCRIPT_XHR_ACCEPT_PREFIX)) {
          extensionAccept = a.split('/')
          return false
        } else {
          return true
        }
      })
      .join(', ')

    return {
      acceptHeader: nextAccept.length ? nextAccept : undefined,
      extensionId: extensionAccept[1],
      xhrToken: extensionAccept[2]
    }
  }

  /**
  * Checks if the request looks like a preflgith csxhr request
  * @param method: the request method
  * @param requestHeaders: the request headers
  * @return true if this looks preflight
  */
  _isPreflightCSXHRRequest (method, requestHeaders) {
    if (method !== 'OPTIONS') { return false }
    if (!requestHeaders['Access-Control-Request-Headers']) { return false }
    if (requestHeaders['Accept'] && requestHeaders['Accept'].indexOf(CR_CONTENT_SCRIPT_XHR_ACCEPT_PREFIX) !== -1) { return false }

    return true
  }

  /**
  * Handles the before send headers event on content scripts
  * @param details: the details of the request
  * @return the updated headers or undefined
  */
  updateCSXHRBeforeSendHeaders = (details) => {
    if (details.resourceType !== 'xhr') { return undefined }

    if (this._isPreflightCSXHRRequest(details.method, details.requestHeaders)) {
      if (!details.webContentsId) { return undefined }
      const requestWebContents = webContents.fromId(details.webContentsId)
      if (!requestWebContents || requestWebContents.isDestroyed()) { return undefined }
      const purl = new URL(ElectronWebContents.getHostUrl(requestWebContents))
      const matchingRuntime = Array.from(this.runtimes.values()).find((runtime) => {
        return CRExtensionMatchPatterns.matchUrls(
          purl.protocol,
          purl.hostname,
          purl.pathname,
          [].concat.apply([],
            runtime.extension.manifest.contentScripts.map((cs) => cs.matches)
          )
        )
      })

      if (matchingRuntime) {
        this[privPreflightXHRRequests].set(details.id, details.requestHeaders['Origin'])
      }

      return undefined
    } else {
      // Look to see if we have credentials
      const { acceptHeader, extensionId, xhrToken } = this._extractCSXHRAcceptHeader(details.requestHeaders)
      const nextHeaders = { 'Accept': acceptHeader }

      if (!extensionId || !xhrToken) { return nextHeaders }

      // Check we have the credentials
      const runtime = this.runtimes.get(extensionId)
      if (!runtime || runtime.contentScript.xhrToken !== xhrToken) { return nextHeaders }

      // Check we are able to match this url
      if (!details.webContentsId) { return undefined }
      const requestWebContents = webContents.fromId(details.webContentsId)
      if (!requestWebContents || requestWebContents.isDestroyed()) { return nextHeaders }
      const purl = new URL(ElectronWebContents.getHostUrl(requestWebContents))
      const matches = CRExtensionMatchPatterns.matchUrls(
        purl.protocol,
        purl.hostname,
        purl.pathname,
        [].concat.apply([],
          runtime.extension.manifest.contentScripts.map((cs) => cs.matches)
        )
      )
      if (!matches) { return nextHeaders }

      // Looks like an extension request
      this[privOpenXHRRequests].set(details.id, details.requestHeaders['Origin'])

      return nextHeaders
    }
  }

  /**
  * Handles the headers received on content scripts
  * @param details: the details of the request
  * @return the updated headers
  */
  updateCSXHROnHeadersReceived = (details) => {
    // Check we are waiting
    if (details.resourceType !== 'xhr') { return }

    // Preflight request
    if (this[privPreflightXHRRequests].has(details.id)) {
      const accessControlAllowOrigin = details.responseHeaders['access-control-allow-origin']
      const updatedHeaders = {
        ...details.responseHeaders,
        'access-control-allow-credentials': ['true'],
        'access-control-allow-origin': !accessControlAllowOrigin || accessControlAllowOrigin[0] === '*'
          ? [this[privPreflightXHRRequests].get(details.id)]
          : accessControlAllowOrigin
      }

      this[privPreflightXHRRequests].delete(details.id)
      return updatedHeaders
    }

    // Open request
    if (this[privOpenXHRRequests].has(details.id)) {
      const updatedHeaders = {
        ...details.responseHeaders,
        'access-control-allow-credentials': ['true'],
        'access-control-allow-origin': [this[privOpenXHRRequests].get(details.id)]
      }

      this[privOpenXHRRequests].delete(details.id)
      return updatedHeaders
    }
  }

  /**
  * Handles the a content script xhr ending in error
  * @param details: the details of the request
  * @param responder: function to call with updated headers
  */
  onCSXHRError = (details) => {
    this[privOpenXHRRequests].delete(details.id)
    this[privPreflightXHRRequests].delete(details.id)
  }

  /* ****************************************************************************/
  // WebRequest
  /* ****************************************************************************/

  /**
  * Runs the before request code provided by the extension
  * @param details: the details of the request
  * @return modifiers that will cancel or redirect the request
  */
  runExtensionOnBeforeRequest = (details) => {
    return Array.from(this.runtimes.values()).reduce((modifier, runtime) => {
      if (modifier) { return modifier }
      return runtime.runExtensionOnBeforeRequest(details)
    }, undefined)
  }
}

export default CRExtensionRuntimeHandler
