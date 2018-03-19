import { ipcMain, webContents, BrowserWindow, app } from 'electron'
import { mailboxStore } from 'stores/mailbox'
import { evtMain } from 'AppEvents'
import {
  WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED,
  WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED
} from 'shared/ipcEvents'
import WaveboxWindow from 'Windows/WaveboxWindow'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'

const privActiveTabId = Symbol('privActiveTabId')

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

    this[privActiveTabId] = undefined

    // Bind event listeners
    mailboxStore.listen(this.attemptEmitTabActivatedOnMailboxesChanged)
    ipcMain.on(WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED, this.handleMailboxesWebViewAttached)
    ipcMain.on(WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED, this.handleExtensionWebViewAttached)
  }

  destroy () {
    mailboxStore.unlisten(this.attemptEmitTabActivatedOnMailboxesChanged)
    ipcMain.removeListener(WB_MAILBOXES_WINDOW_MAILBOX_WEBVIEW_ATTACHED, this.handleMailboxesWebViewAttached)
    ipcMain.removeListener(WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED, this.handleExtensionWebViewAttached)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get activeTabId () {
    return this.attachedMailboxes.has(this[privActiveTabId]) ? this[privActiveTabId] : undefined
  }
  get allWebContentIds () { return Array.from(this.attachedMailboxes.keys()) }

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
        evtMain.emit(evtMain.WB_TAB_DESTROYED, {}, data.webContentsId)
      })

      evtMain.emit(evtMain.WB_TAB_CREATED, {}, data.webContentsId)

      // Sometimes the active tab change call fails because the webview is not
      // yet attached. It fails silently and doesn't set, so run it again here
      // to see if we can re-emit
      this.attemptEmitTabActivatedOnMailboxesChanged(mailboxStore.getState())
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
  * @param mailboxState: the new mailbox state
  */
  attemptEmitTabActivatedOnMailboxesChanged = (mailboxState) => {
    const mailboxId = mailboxState.activeMailboxId()
    const serviceType = mailboxState.activeMailboxService()
    const tabId = this.getWebContentsId(mailboxId, serviceType)

    if (tabId && tabId !== this[privActiveTabId]) {
      const browserWindow = BrowserWindow.fromWebContents(webContents.fromId(this.webContentsId))
      if (browserWindow) {
        this[privActiveTabId] = tabId
        evtMain.emit(evtMain.WB_TAB_ACTIVATED, {}, browserWindow.id, tabId)
      }
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
      const mailbox = mailboxStore.getState().getMailbox(mailboxId)
      const service = mailbox ? mailbox.serviceForType(serviceType) : undefined
      return { mailboxId, serviceType, mailbox, service, match: mailbox && service }
    } else {
      return { match: false }
    }
  }

  /**
  * Gets the webcontents id for a mailbox and service
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @return the web contents id or null
  */
  getWebContentsId (mailboxId, serviceType) {
    const wcId = Array.from(this.attachedMailboxes.keys()).find((wcId) => {
      const rec = this.attachedMailboxes.get(wcId)
      return rec.mailboxId === mailboxId && rec.serviceType === serviceType
    })
    return wcId === undefined ? null : wcId
  }

  /**
  * Gets the web content ids for a specific mailbox
  * @param mailboxId: the id of the mailbox
  * @return a list of web content ids that match
  */
  getWebContentIdsForMailbox (mailboxId) {
    return Array.from(this.attachedMailboxes.keys())
      .filter((wcId) => {
        const rec = this.attachedMailboxes.get(wcId)
        return rec.mailboxId === mailboxId
      })
  }

  /**
  * Gets the metrics for a running service
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @return the metrics for the service or undefined
  */
  getServiceMetrics (mailboxId, serviceType) {
    const wcId = this.getWebContentsId(mailboxId, serviceType)
    if (!wcId) { return undefined }

    const wc = webContents.fromId(wcId)
    if (!wc) { return undefined }

    const pid = wc.getOSProcessId()
    return app.getAppMetrics().find((metric) => metric.pid === pid)
  }

  /* ****************************************************************************/
  // Getters: Tabs
  /* ****************************************************************************/

  /**
  * @param tabId: the id of the tab
  * @return the info about the tab
  */
  tabMetaInfo (tabId) {
    const val = this.attachedMailboxes.get(tabId)
    if (val && val.serviceType && val.mailboxId) {
      return {
        backing: WINDOW_BACKING_TYPES.MAILBOX_SERVICE,
        mailboxId: val.mailboxId,
        serviceType: val.serviceType
      }
    } else {
      return undefined
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
  * @param webContentsId: the id of the webcontents to get for
  * @return the target url for the given webContentsId
  */
  getTargetUrl (webContentsId) {
    return this.targetUrls.get(webContentsId)
  }

  /**
  * Gets the open window count for a mailboxId and serviceType
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @return the number of windows that owned by the given items
  */
  getOpenWindowCount (mailboxId, serviceType) {
    const mailboxesWindowId = WaveboxWindow.fromWebContentsId(this.webContentsId).browserWindowId
    const count = WaveboxWindow.all().reduce((acc, w) => {
      if (w.browserWindowId === mailboxesWindowId) { return acc }
      const windowCount = w.tabIds().reduce((acc, tabId) => {
        const meta = w.tabMetaInfo(tabId)
        if (!meta) { return acc }
        if (!meta.backing === WINDOW_BACKING_TYPES.MAILBOX_SERVICE) { return acc }
        if (meta.mailboxId !== mailboxId || meta.serviceType !== serviceType) { return acc }
        return acc + 1
      }, 0)
      return acc + windowCount
    }, 0)

    return count
  }
}

export default MailboxesWindowTabManager
