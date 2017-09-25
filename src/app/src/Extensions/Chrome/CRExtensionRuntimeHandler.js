import { webContents, ipcMain } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import url from 'url'
import CRDispatchManager from './CRDispatchManager'
import CRExtensionRuntime from './CRExtensionRuntime'
import {
  CR_EXTENSION_PROTOCOL
} from 'shared/extensionApis'
import {
  CRX_RUNTIME_SENDMESSAGE,
  CRX_TABS_SENDMESSAGE,
  CRX_RUNTIME_ONMESSAGE_
} from 'shared/crExtensionIpcEvents'
import {
  WBECRX_GET_EXTENSION_RUNTIME_DATA,
  WBECRX_GET_EXTENSION_RUNTIME_CONTEXT_MENU_DATA,
  WBECRX_LAUNCH_OPTIONS,
  WBECRX_INSPECT_BACKGROUND
} from 'shared/ipcEvents'

class CRExtensionRuntimeHandler {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.runtimes = new Map()

    CRDispatchManager.registerHandler(CRX_RUNTIME_SENDMESSAGE, this._handleRuntimeSendmessage)
    CRDispatchManager.registerHandler(CRX_TABS_SENDMESSAGE, this._handleTabsSendmessage)
    ipcMain.on(WBECRX_GET_EXTENSION_RUNTIME_DATA, this._handleGetRuntimeData)
    ipcMain.on(WBECRX_GET_EXTENSION_RUNTIME_CONTEXT_MENU_DATA, this._handleGetRuntimeContextMenuData)
    ipcMain.on(WBECRX_LAUNCH_OPTIONS, this._handleOpenOptionsPage)
    ipcMain.on(WBECRX_INSPECT_BACKGROUND, this._handleInspectBackground)
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
    const safePath = purl.path.replace(/(\.\.\/)/, '').replace(/(\/\.\.)$/, '')
    fs.readFile(path.join(runtime.extension.srcPath, safePath))
      .then((data) => responder(data))
      .catch(() => responder(-6)) // not found
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
      [ extensionId, evt.sender.id, message ],
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
    const targetWebcontents = webContents.fromId(tabId)
    if (!targetWebcontents) {
      responseCallback(new Error(`Could not find tab ${tabId}`))
      return
    }

    CRDispatchManager.requestAllOnTarget(
      targetWebcontents,
      `${CRX_RUNTIME_ONMESSAGE_}${extensionId}`,
      [ extensionId, isBackgroundPage ? null : evt.sender.id, message ],
      (evt, err, response) => {
        responseCallback(err, response)
      }
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
  * @param evt: the event that fired
  */
  _handleGetRuntimeContextMenuData = (evt) => {
    const data = Array.from(this.runtimes.keys())
      .reduce((acc, key) => {
        acc[key] = this.runtimes.get(key).buildUIRuntimeContextMenuData()
        return acc
      }, {})
    evt.returnValue = data
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
  // Window open
  /* ****************************************************************************/

  /**
  * Checks to see if a window should open as a popout
  * @param webContentsId: the id of the webcontents
  * @param url: the url to open with
  * @param parsedUrl: the parsed url
  * @param disposition: the open mode disposition
  * @return true if the window should open as popout
  */
  shouldOpenWindowAsPopout (webContentsId, url, parsedUrl, disposition) {
    return !!Array.from(this.runtimes.values()).find((runtime) => {
      return runtime.shouldOpenWindowAsPopout(webContentsId, url, parsedUrl, disposition)
    })
  }
}

export default CRExtensionRuntimeHandler
