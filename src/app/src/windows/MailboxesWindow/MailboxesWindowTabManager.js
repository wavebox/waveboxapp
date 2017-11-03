import { ipcMain, webContents, BrowserWindow } from 'electron'
import mailboxStore from 'stores/mailboxStore'
import { evtMain } from 'AppEvents'
import {
  WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED,
  WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED,
  WB_MAILBOXES_WINDOW_FETCH_OPEN_WINDOW_COUNT
} from 'shared/ipcEvents'
import appWindowManager from 'R/appWindowManager'

const privQueuedMailboxToTabChange = Symbol('privQueuedMailboxToTabChange')

class MailboxesWindowTabManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param webContentsId: the id of the managing webcontents
  */
  constructor (webContentsId) {
    this.webContentsId = webContentsId
    this.attachedMailboxes = new Map()
    this.attachedExtensions = new Map()
    this.targetUrls = new Map()

    this[privQueuedMailboxToTabChange] = null

    // Bind event listeners
    mailboxStore.on('changed:active', this.handleActiveMailboxChanged)
    ipcMain.on(WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED, this.handleMailboxesWebViewAttached)
    ipcMain.on(WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED, this.handleExtensionWebViewAttached)
    ipcMain.on(WB_MAILBOXES_WINDOW_FETCH_OPEN_WINDOW_COUNT, this.handleFetchOpenWindowCount)
  }

  destroy () {
    mailboxStore.removeListener('changed:active', this.handleActiveMailboxChanged)
    ipcMain.removeListener(WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED, this.handleMailboxesWebViewAttached)
    ipcMain.removeListener(WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED, this.handleExtensionWebViewAttached)
    ipcMain.removeListener(WB_MAILBOXES_WINDOW_FETCH_OPEN_WINDOW_COUNT, this.handleFetchOpenWindowCount)
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
    if (evt.sender.id === this.webContentsId) {
      this.attachedMailboxes.set(data.webContentsId, data)

      const contents = webContents.fromId(data.webContentsId)
      contents.on('update-target-url', this.handleWebViewUpdateTargetUrl)
      contents.once('destroyed', (evt) => {
        this.attachedMailboxes.delete(data.webContentsId)
        this.attachedExtensions.delete(data.webContentsId)
        this.targetUrls.delete(data.webContentsId)
        evtMain.emit(evtMain.WB_TAB_DESTROYED, data.webContentsId)
      })

      evtMain.emit(evtMain.WB_TAB_CREATED, data.webContentsId)

      // Look to see if there was a queued change event
      if (this[privQueuedMailboxToTabChange]) {
        const { mailboxId, serviceType } = this[privQueuedMailboxToTabChange]
        if (mailboxId === data.mailboxId && serviceType === data.serviceType) {
          const browserWindow = BrowserWindow.fromWebContents(webContents.fromId(this.webContentsId))
          const tabId = this.getWebContentsId(mailboxId, serviceType)

          if (browserWindow && tabId) {
            evtMain.emit(evtMain.WB_TAB_ACTIVATED, browserWindow.id, tabId)
          }
        }
        this[privQueuedMailboxToTabChange] = null
      }
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
  // Event handlers: Mailboxes
  /* ****************************************************************************/

  /**
  * Handles the active mailbox chaning
  * @param evt: the event that fired
  */
  handleActiveMailboxChanged = (evt) => {
    const browserWindow = BrowserWindow.fromWebContents(webContents.fromId(this.webContentsId))
    const tabId = this.getWebContentsId(evt.mailboxId, evt.serviceType)

    if (browserWindow && tabId) {
      this[privQueuedMailboxToTabChange] = null
      evtMain.emit(evtMain.WB_TAB_ACTIVATED, browserWindow.id, tabId)
    } else {
      // Sometimes the mailbox changes comes in before the webview is mounted.
      // To cope with this queue it up to dequeue on mount
      this[privQueuedMailboxToTabChange] = evt
    }
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

  /**
  * Gets the webcontents id for a mailbox and service
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  */
  getWebContentsId (mailboxId, serviceType) {
    const wcId = Array.from(this.attachedMailboxes.keys()).find((wcId) => {
      const rec = this.attachedMailboxes.get(wcId)
      return rec.mailboxId === mailboxId && rec.serviceType === serviceType
    })
    return wcId === undefined ? null : wcId
  }

  /**
  * @return a list of all attached mailboxes
  */
  allWebContentIds () {
    return Array.from(this.attachedMailboxes.keys())
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

export default MailboxesWindowTabManager
