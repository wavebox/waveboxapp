import { ipcMain, BrowserWindow, webContents } from 'electron'
import { evtMain } from 'AppEvents'
import ContentWindow from 'Windows/ContentWindow'
import WaveboxWindow from 'Windows/WaveboxWindow'
import AuthWindow from 'Windows/AuthWindow'
import url from 'url'
import { mailboxStore } from 'stores/mailbox'
import { WindowOpeningHandler } from '../WindowOpeningEngine'
import { WB_NEW_WINDOW, WB_FOCUS_AUTH_WINDOW } from 'shared/ipcEvents'
import { WAVEBOX_HOSTED_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import WINDOW_TYPES from '../WindowTypes'
import WINDOW_BACKING_TYPES from '../WindowBackingTypes'

class MailboxesWindowBehaviour {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param webContentsId: the host window webcontents
  * @param tabManager: the tab manager for the window
  */
  constructor (webContentsId, tabManager) {
    this.webContentsId = webContentsId
    this.tabManager = tabManager

    evtMain.on(evtMain.WB_TAB_CREATED, this.handleTabCreated)
    ipcMain.on(WB_NEW_WINDOW, this.handleOpenIPCWaveboxWindow)
    ipcMain.on(WB_FOCUS_AUTH_WINDOW, this.handleIPCFocusAuthWindow)
  }

  destroy () {
    evtMain.removeListener(evtMain.WB_TAB_CREATED, this.handleTabCreated)
    ipcMain.removeListener(WB_NEW_WINDOW, this.handleOpenIPCWaveboxWindow)
    ipcMain.removeListener(WB_FOCUS_AUTH_WINDOW, this.handleIPCFocusAuthWindow)
  }

  /* ****************************************************************************/
  // Event handlers: App
  /* ****************************************************************************/

  /**
  * Handles a new tab being created
  * @param evt: the event that fired
  * @param webContentsId: the id of the webcontents
  */
  handleTabCreated = (evt, webContentsId) => {
    const contents = webContents.fromId(webContentsId)
    if (contents && contents.getType() === 'webview' && contents.hostWebContents.id === this.webContentsId) {
      contents.on('new-window', this.handleWebViewNewWindow)
      contents.on('will-navigate', this.handleWebViewWillNavigate)
      contents.on('before-input-event', this.handleBeforeInputEvent)
      contents.on('destroyed', () => {
        contents.removeListener('before-input-event', this.handleBeforeInputEvent) // Doesn't get un-bound automatically
      })
    }
  }

  /* ****************************************************************************/
  // Event handlers: IPC
  /* ****************************************************************************/

  /**
  * Opens a new content window
  * @param evt: the event that fired
  * @param body: the arguments from the body
  */
  handleOpenIPCWaveboxWindow = (evt, body) => {
    if (evt.sender.id === this.webContentsId) {
      const contentWindow = new ContentWindow(body.mailboxId && body.serviceType ? {
        backing: WINDOW_BACKING_TYPES.MAILBOX_SERVICE,
        mailboxId: body.mailboxId,
        serviceType: body.serviceType
      } : undefined)

      const window = BrowserWindow.fromWebContents(evt.sender)
      contentWindow.create(window, body.url, body.partition, body.windowPreferences, body.webPreferences)
    }
  }

  /**
  * Focuses an auth window
  * @param evt: the event that fired
  */
  handleIPCFocusAuthWindow = (evt) => {
    if (evt.sender.id === this.webContentsId) {
      const win = WaveboxWindow.getOfType(AuthWindow)
      if (win) {
        win.focus()
      }
    }
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * Gets the opening browser window from an event
  * @param evt: the event that sent, should have evt.sender
  * @return the top-level browser window that fired
  */
  _getOpeningBrowserWindow (evt) {
    if (!evt.sender) { return undefined }
    if (evt.sender.hostWebContents) {
      return BrowserWindow.fromWebContents(evt.sender.hostWebContents)
    } else {
      return BrowserWindow.fromWebContents(evt.sender)
    }
  }

  /* ****************************************************************************/
  // WebView Events
  /* ****************************************************************************/

  /**
  * Handles a new window being generated from a webview
  * @param evt: the event that fired
  * @param targetUrl: the webview url
  * @param frameName: the name of the frame
  * @param disposition: the frame disposition
  * @param options: the browser window options
  * @param additionalFeatures: The non-standard features
  */
  handleWebViewNewWindow = (evt, targetUrl, frameName, disposition, options, additionalFeatures) => {
    WindowOpeningHandler.handleOpenNewWindow(evt, {
      targetUrl: targetUrl,
      frameName: frameName,
      disposition: disposition,
      options: options,
      additionalFeatures: additionalFeatures,
      openingBrowserWindow: this._getOpeningBrowserWindow(evt),
      openingWindowType: WINDOW_TYPES.MAIN,
      tabMetaInfo: this.tabManager.tabMetaInfo(evt.sender.id),
      provisionalTargetUrl: this.tabManager.getTargetUrl(evt.sender.id),
      mailbox: this.tabManager.getService(evt.sender.id).mailbox
    })
  }

  /**
  * Handles the webview navigating
  * @param evt: the event that fired
  * @param targetUrl: the url we're navigating to
  */
  handleWebViewWillNavigate = (evt, targetUrl) => {
    // Extensions
    if (this.tabManager.hasExtensionPane(evt.sender.id)) {
      if (url.parse(targetUrl).protocol !== WAVEBOX_HOSTED_EXTENSION_PROTOCOL + ':') {
        evt.preventDefault()
        return
      }
    }

    WindowOpeningHandler.handleWillNavigate(evt, {
      targetUrl: targetUrl,
      openingBrowserWindow: this._getOpeningBrowserWindow(evt),
      openingWindowType: WINDOW_TYPES.MAIN,
      tabMetaInfo: this.tabManager.tabMetaInfo(evt.sender.id),
      mailbox: this.tabManager.getService(evt.sender.id).mailbox
    })
  }

  /**
  * Checks to see if any key combinations are banned from entering the webview.
  * These would be ones that interfere with accelerators
  * @param evt: the event that fired
  * @param input: the input details
  */
  handleBeforeInputEvent = (evt, input) => {
    // Do the fastest check we can first
    if (!input.shift && !input.control && !input.alt && !input.meta) { return }

    // Grab everything we need dropping out as we go...
    const webContentsId = evt.sender.id
    if (!this.tabManager.hasServiceId(webContentsId)) { return }
    const { mailboxId, serviceType } = this.tabManager.getServiceId(webContentsId)
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) { return }
    const service = mailbox.serviceForType(serviceType)
    if (!service) { return }

    if (service.shouldPreventInputEvent(input)) {
      evt.preventDefault()
      evtMain.emit(evtMain.INPUT_EVENT_PREVENTED, {}, evt.sender.id, input)
    }
  }
}

export default MailboxesWindowBehaviour
