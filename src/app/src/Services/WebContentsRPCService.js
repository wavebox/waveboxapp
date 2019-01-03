import { app, ipcMain, BrowserWindow, dialog, webContents } from 'electron'
import { URL } from 'url'
import { ElectronWebContents } from 'ElectronTools'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import { CRExtensionManager } from 'Extensions/Chrome'
import { ELEVATED_LOG_PREFIX } from 'shared/constants'
import { CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import {
  WCRPC_DOM_READY,
  WCRPC_DID_FRAME_FINISH_LOAD,
  WCRPC_DID_FINISH_LOAD,
  WCRPC_PERMISSION_REQUESTS_CHANGED,
  WCRPC_CLOSE_WINDOW,
  WCRPC_OPEN_RECENT_LINK,
  WCRPC_OPEN_READING_QUEUE_LINK,
  WCRPC_SEND_INPUT_EVENT,
  WCRPC_SEND_INPUT_EVENTS,
  WCRPC_SHOW_ASYNC_MESSAGE_DIALOG,
  WCRPC_SYNC_GET_INITIAL_HOST_URL,
  WCRPC_SYNC_GET_GUEST_PRELOAD_CONFIG,
  WCRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG,
  WCRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG,
  WCRPC_RESOLVE_PERMISSION_REQUEST
} from 'shared/webContentsRPC'
import { PermissionManager } from 'Permissions'
import os from 'os'
import LinkOpener from 'LinkOpener'
import { T } from 'i18n'

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
    ipcMain.on(WCRPC_OPEN_RECENT_LINK, this._handleOpenRecentLink)
    ipcMain.on(WCRPC_OPEN_READING_QUEUE_LINK, this._handleOpenReadingQueueLink)
    ipcMain.on(WCRPC_SEND_INPUT_EVENT, this._handleSendInputEvent)
    ipcMain.on(WCRPC_SEND_INPUT_EVENTS, this._handleSendInputEvents)
    ipcMain.on(WCRPC_SHOW_ASYNC_MESSAGE_DIALOG, this._handleShowAsyncMessageDialog)
    ipcMain.on(WCRPC_SYNC_GET_INITIAL_HOST_URL, this._handleSyncGetInitialHostUrl)
    ipcMain.on(WCRPC_SYNC_GET_GUEST_PRELOAD_CONFIG, this._handleSyncGetGuestPreloadInfo)
    ipcMain.on(WCRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG, this._handleSyncGetExtensionContentScriptPreloadInfo)
    ipcMain.on(WCRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG, this._handleSyncGetExtensionHostedPreloadInfo)
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
      contents.on('did-finish-load', this._handleDidFinishLoad)
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

  _handleDidFinishLoad = (evt) => {
    evt.sender.send(WCRPC_DID_FINISH_LOAD, evt.sender.id)
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
      buttons: [T('Leave'), T('Stay')],
      title: '',
      message: T('Do you want to leave this site?'),
      detail: T('Changes you made may not be saved.'),
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
  * Handles the opening of a recent link
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  * @param recentItem: the item we're trying to open
  */
  _handleOpenRecentLink = (evt, serviceId, recentItem) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    LinkOpener.openRecentLink(evt.sender, serviceId, recentItem)
  }

  /**
  * Handles the opening of a reading queue item
  * @param evt: the event that fired
  * @param serviceId: the id of the service to open in
  * @param readingItem: the reading item to open
  */
  _handleOpenReadingQueueLink = (evt, serviceId, readingItem) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    LinkOpener.openReadingQueueLink(evt.sender, serviceId, readingItem)
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
      console.error(`Failed to respond to "${WCRPC_SYNC_GET_INITIAL_HOST_URL}" continuing with unknown side effects`, ex)
      evt.returnValue = ''
    }
  }

  /**
  * Synchronously gets the guest preload info
  * @param evt: the event that fired
  * @param currentUrl: the current url sent by the page
  */
  _handleSyncGetGuestPreloadInfo = (evt, currentUrl) => {
    if (!this[privConnected].has(evt.sender.id)) {
      evt.returnValue = {}
      return
    }

    // See note in _handleSyncGetInitialHostUrl about initialHostUrl
    try {
      evt.returnValue = {
        launchSettings: settingsStore.getState().launchSettingsJS(),
        launchUserSettings: userStore.getState().launchSettingsJS(),
        extensions: CRExtensionManager.runtimeHandler.getAllContentScriptGuestConfigs(),
        initialHostUrl: !currentUrl || currentUrl === 'about:blank' ? ElectronWebContents.getHostUrl(evt.sender) : currentUrl,
        notificationPermission: this[privNotificationService].getDomainPermissionForWebContents(evt.sender, currentUrl),
        paths: {},
        platform: process.platform,
        arch: process.arch,
        osRelease: os.release()
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WCRPC_SYNC_GET_GUEST_PRELOAD_CONFIG}" continuing with unknown side effects`, ex)
      evt.returnValue = {}
    }
  }

  /**
  * Synchronously gets the extension runtime config for a contentscript
  * @param evt: the event that fired
  * @param extensionId: the id of the extension
  */
  _handleSyncGetExtensionContentScriptPreloadInfo = (evt, extensionId) => {
    if (!this[privConnected].has(evt.sender.id)) {
      evt.returnValue = null
      return
    }

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
      console.error(`Failed to respond to "${WCRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG}" continuing with unknown side effects`, ex)
      evt.returnValue = null
    }
  }

  /**
  * Synchronously gets the extension runtime config for a hosted extension
  * @param evt: the event that fired
  * @param extensionId: the id of the extension
  */
  _handleSyncGetExtensionHostedPreloadInfo = (evt, extensionId) => {
    if (!this[privConnected].has(evt.sender.id)) {
      evt.returnValue = null
      return
    }

    // See note in _handleSyncGetInitialHostUrl about the url
    try {
      const wcUrl = evt.sender.getURL()
      const parsedUrl = new URL(!wcUrl || wcUrl === 'about:blank'
        ? ElectronWebContents.getHostUrl(evt.sender)
        : wcUrl
      )
      if (parsedUrl.protocol !== `${CR_EXTENSION_PROTOCOL}:` || parsedUrl.hostname !== extensionId) {
        // Something's not quite right in this case
        evt.returnValue = {
          extensionId: extensionId,
          hasRuntime: false
        }
      } else {
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
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WCRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG}" continuing with unknown side effects`, ex)
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
