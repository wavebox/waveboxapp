import { app, ipcMain, BrowserWindow, dialog, webContents } from 'electron'
import { ElectronWebContents } from 'ElectronTools'
import { settingsStore } from 'stores/settings'
import { CRExtensionManager } from 'Extensions/Chrome'
import { ELEVATED_LOG_PREFIX } from 'shared/constants'
import {
  WCRPC_DOM_READY,
  WCRPC_DID_FRAME_FINISH_LOAD,
  WCRPC_PERMISSION_REQUESTS_CHANGED,
  WCRPC_CLOSE_WINDOW,
  WCRPC_SEND_INPUT_EVENT,
  WCRPC_SEND_INPUT_EVENTS,
  WCRPC_SHOW_ASYNC_MESSAGE_DIALOG,
  WCRPC_SYNC_GET_GUEST_PRELOAD_CONFIG,
  WCRPC_SYNC_GET_EXTENSION_PRELOAD_CONFIG,
  WCRPC_RESOLVE_PERMISSION_REQUEST
} from 'shared/webContentsRPC'
import { PermissionManager } from 'Permissions'

const privConnected = Symbol('privConnected')
const privNotificationService = Symbol('privNotificationService')

class WebContentsRPCService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param notificationService: the notification service
  */
  constructor (notificationService) {
    this[privNotificationService] = notificationService

    this[privConnected] = new Set()

    PermissionManager.on('unresolved-permission-requests-changed', this._handleUnresolvedPermissionRequestChanged)
    app.on('web-contents-created', this._handleWebContentsCreated)

    ipcMain.on(WCRPC_CLOSE_WINDOW, this._handleCloseWindow)
    ipcMain.on(WCRPC_SEND_INPUT_EVENT, this._handleSendInputEvent)
    ipcMain.on(WCRPC_SEND_INPUT_EVENTS, this._handleSendInputEvents)
    ipcMain.on(WCRPC_SHOW_ASYNC_MESSAGE_DIALOG, this._handleShowAsyncMessageDialog)
    ipcMain.on(WCRPC_SYNC_GET_GUEST_PRELOAD_CONFIG, this._handleSyncGetGuestPreloadInfo)
    ipcMain.on(WCRPC_SYNC_GET_EXTENSION_PRELOAD_CONFIG, this._handleSyncGetExtensionPreloadInfo)
    ipcMain.on(WCRPC_RESOLVE_PERMISSION_REQUEST, this._handleResolvePermissionRequest)
  }

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  /**
  * Handles a webcontents being created by binding the event pass-throughs to it
  * @param evt: the event that fired
  * @param contents: the contents that were created
  */
  _handleWebContentsCreated = (evt, contents) => {
    setImmediate(() => {
      if (contents.isDestroyed()) { return }
      const webContentsId = contents.id
      if (this[privConnected].has(webContentsId)) { return }
      this[privConnected].add(webContentsId)

      contents.on('dom-ready', this._handleDomReady)
      contents.on('did-frame-finish-load', this._handleFrameFinishLoad)
      contents.on('console-message', this._handleConsoleMessage)
      contents.on('will-prevent-unload', this._handleWillPreventUnload)
      contents.on('destroyed', () => {
        this[privConnected].delete(webContentsId)
      })
    })
  }

  /* ****************************************************************************/
  // Web Content events
  /* ****************************************************************************/

  _handleDomReady = (evt) => {
    evt.sender.send(WCRPC_DOM_READY, evt.sender.id)
  }

  _handleFrameFinishLoad = (evt, isMainFrame) => {
    evt.sender.send(WCRPC_DID_FRAME_FINISH_LOAD, evt.sender.id, isMainFrame)
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

  /* ****************************************************************************/
  // Permission events
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

    wc.hostWebContents.send(WCRPC_PERMISSION_REQUESTS_CHANGED, wcId, pending)
  }

  /* ****************************************************************************/
  // IPC Events
  /* ****************************************************************************/

  /**
  * Closes the browser window
  * @param evt: the event that fired
  */
  _handleCloseWindow = (evt) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    if (!bw || bw.isDestroyed()) { return }
    bw.close()
  }

  /**
  * Sends an input event to the webcontents
  * @param evt: the event that fired
  * @param inputEvent: the input event to send
  */
  _handleSendInputEvent = (evt, inputEvent) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    evt.sender.sendInputEvent(inputEvent)
  }

  /**
  * Sends a set of input events to the webcontents
  * @param evt: the event that fired
  * @param inputEvents: the input event to send
  */
  _handleSendInputEvents = (evt, inputEvents) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    inputEvents.forEach((inputEvent) => {
      evt.sender.sendInputEvent(inputEvent)
    })
  }

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
  * Synchronously gets the guest preload info
  * @param evt: the event that fired
  * @param currentUrl: the current url sent by the page
  */
  _handleSyncGetGuestPreloadInfo = (evt, currentUrl) => {
    if (!this[privConnected].has(evt.sender.id)) { return }

    // Worth noting that webContents.getURL() can sometimes be wrong if this is called early
    // in the exec stack. In case this is the case use the url the client sends to us. It's
    // sandboxed in our own context so there wont be any case for xss

    try {
      evt.returnValue = {
        launchSettings: settingsStore.getState().launchSettingsJS(),
        extensions: CRExtensionManager.runtimeHandler.getAllContentScriptGuestConfigs(),
        initialHostUrl: !currentUrl || currentUrl === 'about:blank' ? ElectronWebContents.getHostUrl(evt.sender) : currentUrl,
        notificationPermission: this[privNotificationService].getDomainPermissionForWebContents(evt.sender, currentUrl),
        paths: {},
        platform: process.platform
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WCRPC_SYNC_GET_GUEST_PRELOAD_CONFIG}" continuing with unknown side effects`, ex)
      evt.returnValue = {}
    }
  }

  /**
  * Synchronously gets the extension runtime config
  * @param evt: the event that fired
  * @param extensionId: the id of the extension
  */
  _handleSyncGetExtensionPreloadInfo = (evt, extensionId) => {
    if (!this[privConnected].has(evt.sender.id)) { return }

    try {
      const hasRuntime = CRExtensionManager.runtimeHandler.hasRuntime(extensionId)
      if (hasRuntime) {
        evt.returnValue = {
          extensionId: extensionId,
          hasRuntime: true,
          runtimeConfig: CRExtensionManager.runtimeHandler.getContentScriptRuntimeConfig(extensionId),
          isBackgroundPage: evt.sender.id === CRExtensionManager.runtimeHandler.getBackgroundPageId(extensionId)
        }
      } else {
        evt.returnValue = {
          extensionId: extensionId,
          hasRuntime: false
        }
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WCRPC_SYNC_GET_EXTENSION_PRELOAD_CONFIG}" continuing with unknown side effects`, ex)
      evt.returnValue = null
    }
  }

  /**
  * Handles the resolution of a permission request
  * @param evt: the event that fired
  */
  _handleResolvePermissionRequest = (evt, wcId, type, permission) => {
    PermissionManager.resolvePermissionRequest(wcId, type, permission)
  }
}

export default WebContentsRPCService
