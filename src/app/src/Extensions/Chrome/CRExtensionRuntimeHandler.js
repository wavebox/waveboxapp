import { webContents, ipcMain } from 'electron'
import fs from 'fs-extra'
import url from 'url'
import CRDispatchManager from './CRDispatchManager'
import CRExtensionRuntime from './CRExtensionRuntime'
import CRExtensionMatchPatterns from 'shared/Models/CRExtension/CRExtensionMatchPatterns'
import {EventEmitter} from 'events'
import {
  CR_EXTENSION_PROTOCOL,
  CR_CONTENT_SCRIPT_XHR_ACCEPT_PREFIX
} from 'shared/extensionApis'
import {
  CRX_RUNTIME_SENDMESSAGE,
  CRX_TABS_SENDMESSAGE,
  CRX_RUNTIME_ONMESSAGE_,
  CRX_RUNTIME_HAS_RESPONDER,
  CRX_PORT_CONNECT_SYNC,
  CRX_PORT_CONNECTED_,
  CRX_PORT_DISCONNECTED_
} from 'shared/crExtensionIpcEvents'
import {
  WBECRX_GET_EXTENSION_RUNTIME_DATA,
  WBECRX_LAUNCH_OPTIONS,
  WBECRX_INSPECT_BACKGROUND,
  WBECRX_CLEAR_ALL_BROWSER_SESSIONS
} from 'shared/ipcEvents'
import { CSPParser, CSPBuilder } from './CSP'
import pathTool from 'shared/pathTool'
import CRExtensionTab from './CRExtensionRuntime/CRExtensionTab'

const privNextPortId = Symbol('privNextPortId')
const privOpenXHRRequests = Symbol('privOpenXHRRequests')

class CRExtensionRuntimeHandler extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()
    this.runtimes = new Map()
    this[privNextPortId] = 0
    this[privOpenXHRRequests] = new Map()

    CRDispatchManager.registerHandler(CRX_RUNTIME_SENDMESSAGE, this._handleRuntimeSendmessage)
    CRDispatchManager.registerHandler(CRX_TABS_SENDMESSAGE, this._handleTabsSendmessage)
    ipcMain.on(WBECRX_GET_EXTENSION_RUNTIME_DATA, this._handleGetRuntimeData)
    ipcMain.on(WBECRX_LAUNCH_OPTIONS, this._handleOpenOptionsPage)
    ipcMain.on(WBECRX_INSPECT_BACKGROUND, this._handleInspectBackground)
    ipcMain.on(CRX_RUNTIME_HAS_RESPONDER, this._handleHasRuntimeResponder)
    ipcMain.on(CRX_PORT_CONNECT_SYNC, this._handlePortConnect)
    ipcMain.on(WBECRX_CLEAR_ALL_BROWSER_SESSIONS, this._handleClearAllBrowserSessions)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get allRuntimes () { return Array.from(this.runtimes.values()) }
  get inUsePartitions () {
    return this.allRuntimes
      .map((runtime) => {
        return runtime.extension.manifest.manifest.hasBackground ? runtime.backgroundPage.partitionId : undefined
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
    const purl = url.parse(request.url)
    if (!purl.hostname || !purl.path) { return responder() }
    const runtime = this.runtimes.get(purl.hostname)
    if (!runtime) { return responder() }

    // Serve the background page
    if (runtime && runtime.backgroundPage.isRunning && purl.path === `/${runtime.backgroundPage.name}`) {
      return responder({
        mimeType: 'text/html',
        data: runtime.backgroundPage.html
      })
    }

    // Serve the asset/file
    const scopedPath = pathTool.scopeToDir(runtime.extension.srcPath, purl.path)
    if (scopedPath) {
      fs.readFile(scopedPath)
        .then((data) => responder(data))
        .catch(() => responder(-6)) // not found
    } else {
      responder(-6) // not found
    }
  }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

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
    evt.returnValue = this.runtimes.has(extensionId)
  }

  /**
  * Sets up a port connection
  * @Param evt: the event that fired
  * @Param
  */
  _handlePortConnect = (evt, extensionId, connectInfo) => {
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
      const backgroundContents = runtime.backgroundPage.webContents
      if (!backgroundContents || backgroundContents.isDestroyed()) { return }
      backgroundContents.sendToAll(`${CRX_PORT_DISCONNECTED_}${portId}`)
    })

    // Emit the connect event
    runtime.backgroundPage.webContents.sendToAll(
      `${CRX_PORT_CONNECTED_}${extensionId}`,
      portId,
      {
        tabId: evt.sender.id,
        tab: CRExtensionTab.dataFromWebContents(runtime.extension, evt.sender),
        url: evt.sender.getURL()
      },
      connectInfo
    )
  }

  /* ****************************************************************************/
  // Data getters
  /* ****************************************************************************/

  /**
  * Gets the runtime data in a synchronous way
  * @param evt: the event that fired
  */
  _handleGetRuntimeData = (evt) => {
    const data = Array.from(this.runtimes.keys())
      .reduce((acc, key) => {
        acc[key] = this.runtimes.get(key).buildUIRuntimeData()
        return acc
      }, {})
    evt.returnValue = data
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

  /* ****************************************************************************/
  // Options
  /* ****************************************************************************/

  /**
  * Opens the options page
  * @param evt: the event that fired
  * @param extensionId: the id of the extension
  */
  _handleOpenOptionsPage = (evt, extensionId) => {
    const runtime = this.runtimes.get(extensionId)
    if (!runtime) { return }
    runtime.optionsPage.launchWindow()
  }

  /**
  * Opens the inspector for the background page
  * @param evt: the event that fired
  * @param extensionId: the id of the extension
  */
  _handleInspectBackground = (evt, extensionId) => {
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
  _handleClearAllBrowserSessions = () => {
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
    const purl = url.parse(requestUrl)
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
  * Handles the before send headers event on content scripts
  * @param details: the details of the request
  * @return the updated headers or undefined
  */
  updateCSXHRBeforeSendHeaders = (details) => {
    if (details.resourceType !== 'xhr') { return }

    // Look to see if we have credentials
    const { acceptHeader, extensionId, xhrToken } = this._extractCSXHRAcceptHeader(details.requestHeaders)
    const nextHeaders = {
      ...details.requestHeaders,
      'Accept': acceptHeader
    }
    if (!extensionId || !xhrToken) { return nextHeaders }

    // Check we have the credentials
    const runtime = this.runtimes.get(extensionId)
    if (!runtime || runtime.contentScript.xhrToken !== xhrToken) { return nextHeaders }

    // Check we are able to match this url
    const requestWebContents = webContents.fromId(details.webContentsId)
    if (!requestWebContents || requestWebContents.isDestroyed()) { return nextHeaders }

    const purl = url.parse(requestWebContents.getURL())
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

  /**
  * Handles the headers received on content scripts
  * @param details: the details of the request
  * @return the updated headers
  */
  updateCSXHROnHeadersReceived = (details) => {
    // Check we are waiting
    if (details.resourceType !== 'xhr') { return }

    if (!this[privOpenXHRRequests].has(details.id)) { return }

    const headers = details.responseHeaders
    const updatedHeaders = {
      ...headers,
      'access-control-allow-credentials': headers['access-control-allow-credentials'] || ['true'],
      'access-control-allow-origin': [this[privOpenXHRRequests].get(details.id)]
    }

    this[privOpenXHRRequests].delete(details.id)
    return updatedHeaders
  }

  /**
  * Handles the a content script xhr ending in error
  * @param details: the details of the request
  * @param responder: function to call with updated headers
  */
  onCSXHRError = (details) => {
    this[privOpenXHRRequests].delete(details.id)
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
