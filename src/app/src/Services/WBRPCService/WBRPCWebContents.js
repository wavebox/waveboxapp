import { webContents, ipcMain, dialog, BrowserWindow } from 'electron'
import { PermissionManager } from 'Permissions'
import {
  WBRPC_PERMISSION_REQUESTS_CHANGED,
  WBRPC_WC_RESOLVE_PERMISSION_REQUEST,
  WBRPC_WC_SEND_INPUT_EVENT,
  WBRPC_WC_SEND_INPUT_EVENTS,
  WBRPC_WC_GO_BACK,
  WBRPC_WC_GO_FORWARD,
  WBRPC_WC_STOP,
  WBRPC_WC_RELOAD,
  WBRPC_WC_LOAD_URL,
  WBRPC_WC_CAN_GO_BACK_SYNC,
  WBRPC_WC_CAN_GO_FORWARD_SYNC,
  WBRPC_WC_GET_URL_SYNC,
  WBRPC_WC_IS_LOADING_SYNC,
  WBRPC_WC_SHOW_ASYNC_MESSAGE_DIALOG,
  WBRPC_SYNC_GET_INITIAL_HOST_URL,
  WBRPC_WCE_DOM_READY,
  WBRPC_WCE_DID_FRAME_FINISH_LOAD,
  WBRPC_WCE_DID_FINISH_LOAD,
  WBRPC_WCE_DID_ATTACH_WEBVIEW
} from 'shared/WBRPCEvents'
import { ELEVATED_LOG_PREFIX } from 'shared/constants'
import { ElectronWebContents } from 'ElectronTools'

const privConnected = Symbol('privConnected')
const privFailedReloadRetry = Symbol('privFailedReloadRetry')

class WBRPCWebContents {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConnected] = new Set()
    this[privFailedReloadRetry] = new Map()

    // Permissions
    PermissionManager.on('unresolved-permission-requests-changed', this._handleUnresolvedPermissionRequestChanged)
    ipcMain.on(WBRPC_WC_RESOLVE_PERMISSION_REQUEST, this._handleResolvePermissionRequest)

    // WebContent methods
    ipcMain.on(WBRPC_WC_SEND_INPUT_EVENT, this._handleSendInputEvent)
    ipcMain.on(WBRPC_WC_SEND_INPUT_EVENTS, this._handleSendInputEvents)
    ipcMain.on(WBRPC_WC_GO_BACK, this._handleGoBack)
    ipcMain.on(WBRPC_WC_GO_FORWARD, this._handleGoForward)
    ipcMain.on(WBRPC_WC_STOP, this._handleStop)
    ipcMain.on(WBRPC_WC_RELOAD, this._handleReload)
    ipcMain.on(WBRPC_WC_LOAD_URL, this._handleLoadUrl)
    ipcMain.on(WBRPC_WC_CAN_GO_BACK_SYNC, this._handleCanGoBackSync)
    ipcMain.on(WBRPC_WC_CAN_GO_FORWARD_SYNC, this._handleCanGoForwardSync)
    ipcMain.on(WBRPC_WC_GET_URL_SYNC, this._handleGetUrlSync)
    ipcMain.on(WBRPC_WC_IS_LOADING_SYNC, this._handleIsLoadingSync)

    // WebContent utils
    ipcMain.on(WBRPC_WC_SHOW_ASYNC_MESSAGE_DIALOG, this._handleShowAsyncMessageDialog)
    ipcMain.on(WBRPC_SYNC_GET_INITIAL_HOST_URL, this._handleSyncGetInitialHostUrl)
  }

  /**
  * Connects the webcontents
  * @param contents: the webcontents to connect
  */
  connect (contents) {
    this[privConnected].add(contents.id)

    // WebContent events
    contents.on('dom-ready', this._handleDomReady)
    contents.on('did-frame-finish-load', this._handleFrameFinishLoad)
    contents.on('did-finish-load', this._handleDidFinishLoad)
    contents.on('did-attach-webview', this._handleDidAttachWebView)
    contents.on('console-message', this._handleConsoleMessage)

    // WebContent utils
    contents.on('will-prevent-unload', this._handleWillPreventUnload)
    contents.on('did-fail-load', this._handleFailLoad)
  }

  /**
  * Disconnects a webcontents
  * @param contentsId: the id of the webcontents that has been disconnected
  */
  disconnect (contentsId) {
    this[privConnected].delete(contentsId)
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * Gets the ipc target
  * @param evt: the event that came in
  * @param wcId: any supplied webcontents
  * @return the webcontents to run the command on
  */
  _getIPCTarget (evt, wcId) {
    const target = typeof (wcId) === 'number' ? webContents.fromId(wcId) : evt.sender
    return target.isDestroyed() ? undefined : target
  }

  /* ****************************************************************************/
  // IPC: WebContent methods
  /* ****************************************************************************/

  /**
  * Sends an input event to the webcontents
  * @param evt: the event that fired
  * @param inputEvent: the input event to send
  * @param wcId: the id of the webcontents to run this on
  */
  _handleSendInputEvent = (evt, inputEvent, wcId) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const target = this._getIPCTarget(evt, wcId)
    if (target) {
      target.sendInputEvent(inputEvent)
    }
  }

  /**
  * Sends a set of input events to the webcontents
  * @param evt: the event that fired
  * @param inputEvents: the input event to send
  * @param wcId: the id of the webcontents to run this on
  */
  _handleSendInputEvents = (evt, inputEvents, wcId) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const target = this._getIPCTarget(evt, wcId)
    if (target) {
      inputEvents.forEach((inputEvent) => {
        target.sendInputEvent(inputEvent)
      })
    }
  }

  /**
  * Sends the webcontents back
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents to run this on
  */
  _handleGoBack = (evt, wcId) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const target = this._getIPCTarget(evt, wcId)
    if (target) {
      target.goBack()
    }
  }

  /**
  * Sends the webcontents forward
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents to run this on
  */
  _handleGoForward = (evt, wcId) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const target = this._getIPCTarget(evt, wcId)
    if (target) {
      target.goForward()
    }
  }

  /**
  * Stops the webcontents
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents to run this on
  */
  _handleStop = (evt, wcId) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const target = this._getIPCTarget(evt, wcId)
    if (target) {
      target.stop()
    }
  }

  /**
  * Reloads the webcontents
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents to run this on
  */
  _handleReload = (evt, wcId) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const target = this._getIPCTarget(evt, wcId)
    if (target) {
      target.reload()
    }
  }

  /**
  * Loads a url in the webcontents
  * @param evt: the event that fired
  * @param url: the url to load
  * @param wcId: the id of the webcontents to run this on
  */
  _handleLoadUrl = (evt, url, wcId) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const target = this._getIPCTarget(evt, wcId)
    if (target) {
      target.loadURL(url)
    }
  }

  /**
  * Checks if the webcontents can go back
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents to run this on
  */
  _handleCanGoBackSync = (evt, wcId) => {
    try {
      const target = this._getIPCTarget(evt, wcId)
      evt.returnValue = target
        ? target.canGoBack()
        : false
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_WC_CAN_GO_BACK_SYNC}" continuing with unknown side effects`, ex)
      evt.returnValue = false
    }
  }

  /**
  * Checks if the webcontents can go forward
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents to run this on
  */
  _handleCanGoForwardSync = (evt, wcId) => {
    try {
      const target = this._getIPCTarget(evt, wcId)
      evt.returnValue = target
        ? target.canGoForward()
        : false
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_WC_CAN_GO_FORWARD_SYNC}" continuing with unknown side effects`, ex)
      evt.returnValue = false
    }
  }

  /**
  * Gets the url of the webcontents
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents to run this on
  */
  _handleGetUrlSync = (evt, wcId) => {
    try {
      const target = this._getIPCTarget(evt, wcId)
      evt.returnValue = target
        ? target.getURL()
        : ''
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_WC_GET_URL_SYNC}" continuing with unknown side effects`, ex)
      evt.returnValue = ''
    }
  }

  /**
  * Checks if the webcontents is loading
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents to run this on
  */
  _handleIsLoadingSync = (evt, wcId) => {
    try {
      const target = this._getIPCTarget(evt, wcId)
      evt.returnValue = target
        ? target.isLoading()
        : false
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_WC_IS_LOADING_SYNC}" continuing with unknown side effects`, ex)
      evt.returnValue = false
    }
  }

  /* ****************************************************************************/
  // IPC: WebContent events
  /* ****************************************************************************/

  _handleDomReady = (evt) => {
    evt.sender.send(WBRPC_WCE_DOM_READY, evt.sender.id)
  }

  _handleFrameFinishLoad = (evt, isMainFrame) => {
    evt.sender.send(WBRPC_WCE_DID_FRAME_FINISH_LOAD, evt.sender.id, isMainFrame)
  }

  _handleDidFinishLoad = (evt) => {
    evt.sender.send(WBRPC_WCE_DID_FINISH_LOAD, evt.sender.id)
  }

  _handleDidAttachWebView = (evt, wc) => {
    // evt.sender is confusingly the child, so use the hostWebContents to get the receiver
    wc.hostWebContents.send(WBRPC_WCE_DID_ATTACH_WEBVIEW, wc.hostWebContents.id, wc.id)
  }

  _handleConsoleMessage = (evt, level, message, line, sourceId) => {
    if (message.startsWith(ELEVATED_LOG_PREFIX)) {
      const logArgs = [
        '[ELEVATED LOG]',
        `sender=${evt.sender.id}`,
        `line=${line}`,
        `sourceId=${sourceId}`,
        message
      ]
      switch (level) {
        case 1: console.warn(...logArgs); break
        case 2: console.error(...logArgs); break
        default: console.log(...logArgs); break
      }
    }
  }

  /* ****************************************************************************/
  // Permissions
  /* ****************************************************************************/

  /**
  * Handles the set of unresolved permission request handlers changing
  * @param wcId: the id of the webcontents the permissions changed for
  * @param pending: the list of pending requests
  */
  _handleUnresolvedPermissionRequestChanged (wcId, pending) {
    const wc = webContents.fromId(wcId)
    if (!wc || wc.isDestroyed()) { return }
    if (!wc.hostWebContents) { return }

    wc.hostWebContents.send(WBRPC_PERMISSION_REQUESTS_CHANGED, wcId, pending)
  }

  /**
  * Handles the resolution of a permission request
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents
  * @param type: the type of request
  * @param permission: the permission to get
  */
  _handleResolvePermissionRequest = (evt, wcId, type, permission) => {
    PermissionManager.resolvePermissionRequest(wcId, type, permission)
  }

  /* ****************************************************************************/
  // IPC: WebContent utils
  /* ****************************************************************************/

  /**
  * Shows an async message dialog
  * @param evt: the event that fired
  * @param options: the options for the dialog
  */
  _handleShowAsyncMessageDialog = (evt, options) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    dialog.showMessageBox(bw, options, () => {
      /* no-op */
    })
  }

  /**
  * Synchronously gets the initial host url
  * @param evt: the event that fired
  * @param currentUrl: the current url sent by the page
  */
  _handleSyncGetInitialHostUrl = (evt) => {
    // Worth noting that webcontents.getURL() can return about:blank in some instances. This is normally
    // where a window.open() call is made with in a shared process. What happens here is the window initially
    // loads up about:blank that gets redirected to the page later in the stack. If the page navigates within
    // the same domain we don't get a second load event so in this case we can kind of infer domain and protocol
    // from the parent (ElectronWebContents.getHostUrl()). If the page navigates to a non-shared domain
    // (e.g. wavebox.io -> google.com) it does a double load. Loads once with about:blank - inferred to
    // wavebox.io. Then restarts the renderer and loads at google.com.
    try {
      const wcUrl = evt.sender.getURL()
      if (!wcUrl || wcUrl === 'about:blank') {
        evt.returnValue = ElectronWebContents.getHostUrl(evt.sender)
      } else {
        evt.returnValue = wcUrl
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_SYNC_GET_INITIAL_HOST_URL}" continuing with unknown side effects`, ex)
      evt.returnValue = ''
    }
  }

  /**
  * Handles the webcontents attemptying to unload
  * @param evt: the event that fired
  */
  _handleWillPreventUnload = (evt) => {
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    if (!bw || bw.isDestroyed()) { return }

    const choice = dialog.showMessageBox(bw, {
      type: 'question',
      buttons: ['Leave', 'Stay'],
      title: '',
      message: 'Do you want to leave this site?',
      detail: 'Changes you made may not be saved.',
      defaultId: 0,
      cancelId: 1
    })
    if (choice === 0) {
      evt.preventDefault()
    }
  }

  /**
  * Handles the webcontents failing to load
  * @param evt: the event that fired
  * @param errorCode: the error code
  * @param errorDescription: the error description
  * @param validatedURL: the url
  * @param isMainFrame: true if main frame
  * @param frameProcessId: id of the process
  * @param frameRoutingId: routing id of frame
  */
  _handleFailLoad = (evt, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
    // @Thomas101 This is a bit of a workaround. It looks like the bug has been
    // introduced with electron4. Originally reported with wavebox/952 it looks like
    // when loading drive twice with the same url sometimes it can cause the network to
    // flake at the tcp level. This has probably been introduced in the new metro loader
    // so re-look in electron5 to see if it's solved. It's harder to reproduce with devtools
    // open and is quite flakey to reproduce.
    //
    // The work around here is basically to retry once. The user will probably see a flash
    // of the error message, but this is very much a fringe case and it recovers gracefully
    if (!isMainFrame) { return }
    if ([-100, -101].includes(errorCode) === false) { return }
    if (!validatedURL) { return }

    const wc = evt.sender
    const wcId = evt.sender.id
    if (this[privFailedReloadRetry].get(wcId) === validatedURL) { return }

    // Re-start a load
    wc.loadURL(validatedURL)
    this[privFailedReloadRetry].set(wcId, validatedURL)

    // Prepare teardown
    let clearTO = null
    const clearFn = () => {
      this[privFailedReloadRetry].delete(wcId)
      clearTimeout(clearTO)
      if (!wc.isDestroyed()) {
        wc.removeListener('did-finish-load', clearFn)
        wc.removeListener('destroyed', clearFn)
      }
    }
    wc.once('did-finish-load', clearFn)
    wc.on('destroyed', clearFn)
    clearTO = setTimeout(clearFn, 5000)
  }
}

export default WBRPCWebContents
