import { app, ipcMain, BrowserWindow, webContents } from 'electron'
import { evtMain } from 'AppEvents'
import mailboxStore from 'stores/mailboxStore'
import {
  WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED,
  WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED,
  WB_MAILBOXES_WINDOW_FETCH_OPEN_WINDOW_COUNT,
  WB_MAILBOX_TAB_WEBCONTENTS_ATTACHED,
  WB_MAILBOX_TAB_WEBCONTENTES_DETACHED
} from 'shared/ipcEvents'
import appWindowManager from 'R/appWindowManager'

class MailboxesTabManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.attachedMailboxWindows = new Set()
    this.attachedMailboxes = new Map()
    this.attachedExtensions = new Map()
    this.attachedMailboxTabs = new Set()
    this.targetUrls = new Map()

    // Bind event listeners
    app.on('web-contents-created', this.handleAppWebContentsCreated)
    ipcMain.on(WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED, this.handleMailboxesWebViewAttached)
    ipcMain.on(WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED, this.handleExtensionWebViewAttached)
    ipcMain.on(WB_MAILBOXES_WINDOW_FETCH_OPEN_WINDOW_COUNT, this.handleFetchOpenWindowCount)
    evtMain.on(WB_MAILBOX_TAB_WEBCONTENTS_ATTACHED, this.handleMailboxTabAttached)
    evtMain.on(WB_MAILBOX_TAB_WEBCONTENTES_DETACHED, this.handleMailboxTabDetached)
  }

  /* ****************************************************************************/
  // Attached windows
  /* ****************************************************************************/

  /**
  * Attaches a mailbox window
  * @param id: the id of the browser window
  */
  attachMailboxesWindow (id) {
    this.attachedMailboxWindows.add(id)
  }

  /**
  * Detaches a mailbox window
  * @param id: the id of the browser window
  */
  detachMailboxesWindow (id) {
    this.attachedMailboxWindows.delete(id)
  }

  /**
  * Looks to see if there is an attached window with the given webcontents id
  * @param wcId: the id of the webcontents to check
  * @return true if one of the browser windows is attached
  */
  hasMailboxesWindowWithWebContentsId (wcId) {
    const browserWindowId = Array.from(this.attachedMailboxWindows).find((browserWindowId) => {
      const browserWindow = BrowserWindow.fromId(browserWindowId)
      if (browserWindow) {
        return browserWindow.webContents.id === wcId
      } else {
        return false
      }
    })
    return !!browserWindowId
  }

  /* ****************************************************************************/
  // Event handlers: App
  /* ****************************************************************************/

  /**
  * Handles a new web contents being created
  * @param evt: the event that fired
  * @param contents: the webcontent that were created
  */
  handleAppWebContentsCreated = (evt, contents) => {
    if (contents.getType() === 'webview' && this.hasMailboxesWindowWithWebContentsId(contents.hostWebContents.id)) {
      const webContentsId = contents.id
      contents.on('update-target-url', this.handleWebViewUpdateTargetUrl)
      contents.on('destroyed', (evt) => {
        this.attachedMailboxes.delete(webContentsId)
        this.attachedExtensions.delete(webContentsId)
        this.targetUrls.delete(webContentsId)
      })
    }
  }

  /* ****************************************************************************/
  // Event handlers: Mailboxes
  /* ****************************************************************************/

  /**
  * Handles a mailboes webview being attached
  * @param evt: the event that fired
  * @param data: the data that came with the event
  */
  handleMailboxesWebViewAttached = (evt, data) => {
    if (this.hasMailboxesWindowWithWebContentsId(evt.sender.id)) {
      const contents = webContents.fromId(data.webContentsId)

      this.attachedMailboxes.set(data.webContentsId, data)

      evtMain.emit(WB_MAILBOX_TAB_WEBCONTENTS_ATTACHED, data.webContentsId)
      contents.on('destroyed', () => {
        evtMain.emit(WB_MAILBOX_TAB_WEBCONTENTES_DETACHED, data.webContentsId)
      })
    }
  }

  /* ****************************************************************************/
  // Event handlers: Web Contents
  /* ****************************************************************************/

  /**
  * Handles the target url of a webcontents updating
  * @param evt: the event that fired
  * @param targetUrl: the url we're pointing at
  */
  handleWebViewUpdateTargetUrl = (evt, targetUrl) => {
    const webContentsId = evt.sender.id
    if (this.attachedMailboxes.has(webContentsId)) {
      this.targetUrls.set(webContentsId, targetUrl)
    }
  }

  /**
  * Handles an extension webview being attached
  */
  handleExtensionWebViewAttached = (evt, data) => {
    if (evt.sender === this.window.webContents) {
      this.attachedExtensions.set(data.webContentsId, data)
    }
  }

  /* ****************************************************************************/
  // Event handlers: Tabs
  /* ****************************************************************************/

  /**
  * Handles a mailbox tab being attached
  * @param webContentsId: the id of the webcontents
  */
  handleMailboxTabAttached = (webContentsId) => {
    this.attachedMailboxTabs.add(webContentsId)
  }

  /**
  * Handles a mailbox tab being detached
  * @param webContentsId: the id of the webcontents
  */
  handleMailboxTabDetached = (webContentsId) => {
    this.attachedMailboxTabs.delete(webContentsId)
  }

  /* ****************************************************************************/
  // Getters: Services
  /* ****************************************************************************/

  /**
  * Gets the id of the mailbox and service for the given webcontents
  * @param webContentsId: the id of the web contents
  * @return { mailboxId, serviceType, match }
  */
  getServiceId (webContentsId) {
    if (this.attachedMailboxes.has(webContentsId)) {
      const { mailboxId, serviceType } = this.attachedMailboxes.get(webContentsId)
      return { mailboxId, serviceType, match: true }
    } else {
      return { match: false }
    }
  }

  /**
  * Checks to see if we have info about the webcontents id
  * @param webContentsId: the id of the web contents
  * @return true if we have info, false otherwise
  */
  hasServiceId (webContentsId) {
    return this.getServiceId(webContentsId).match
  }

  /**
  * Gets the service and mailbox for the given webcontents id
  * @param webContentsId: the id of the web contents
  * @return { mailboxId, serviceType, mailbox, service, match }
  */
  getService (webContentsId) {
    const { match, mailboxId, serviceType } = this.getServiceId(webContentsId)
    if (match) {
      const mailbox = mailboxStore.getMailbox(mailboxId)
      const service = mailboxStore.getService(mailboxId, serviceType)
      return { mailboxId, serviceType, mailbox, service, match: mailbox && service }
    } else {
      return { match: false }
    }
  }

  /* ****************************************************************************/
  // Getters: Extensions
  /* ****************************************************************************/

  /**
  * Checks to see if there is an extension pane with the given webContents id
  * @return true if there is, false otherwise
  */
  hasExtensionPane (webContentsId) {
    return this.attachedExtensions.has(webContentsId)
  }

  /* ****************************************************************************/
  // Getters: Misc
  /* ****************************************************************************/

  /**
  * @return the target url for the given webContentsId
  */
  getTargetUrl (webContentsId) {
    return this.targetUrls.get(webContentsId)
  }

  /* ****************************************************************************/
  // Getters: Tabs
  /* ****************************************************************************/

  /**
  * @return the webcontents for all the attached mailbox tabs
  */
  getAttachedMailboxTabs () {
    return Array.from(this.attachedMailboxTabs)
      .map((id) => {
        const contents = webContents.fromId(id)
        return contents.isDestroyed() ? undefined : contents
      })
      .filter((wc) => !!wc)
  }

  /**
  * @param webContentsId: the id of the webcontents to check
  * @return true if there is an attached tab
  */
  hasAttachedMailboxTab (webContentsId) {
    return this.attachedMailboxTabs.has(webContentsId)
  }

  /**
  * @param webContentsId: the id of the webcontents to check
  * @return true if the tab is always a single instance in a window (e.g. no tab support)
  */
  isMailboxTabSingleInWindow (webContentsId) {
    if (!this.attachedMailboxTabs.has(webContentsId)) { return false }
    if (this.attachedMailboxes.has(webContentsId)) { return false }
    return true
  }

  /**
  * @param webContents: the id of the webcontents to check
  * @return true if the given mailbox tab is active
  */
  isMailboxTabActive (webContents) {
    if (!this.attachedMailboxTabs.has(webContents.id)) { return false }

    if (this.attachedMailboxes.has(webContents.id)) {
      const { mailboxId, serviceType } = this.getServiceId(webContents.id)
      if (mailboxId === mailboxStore.getActiveMailboxId() && serviceType === mailboxStore.getActiveServiceType()) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  /* ****************************************************************************/
  // Getters: IPC
  /* ****************************************************************************/

  /**
  * Gets the list of open windows for the specified mailbox and service
  * @param evt: the event that fired
  * @param body: the message sent
  */
  handleFetchOpenWindowCount = (evt, body) => {
    const ownerId = `${body.mailboxId}:${body.serviceType}`
    const count = appWindowManager.getContentWindowsWithOwnerId(ownerId).length
    if (body.response) {
      evt.sender.send(body.response, { count: count })
    } else {
      evt.returnValue = { count: count }
    }
  }
}

export default new MailboxesTabManager()
