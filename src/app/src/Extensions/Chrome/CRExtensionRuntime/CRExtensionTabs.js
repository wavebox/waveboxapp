import { BrowserWindow, webContents } from 'electron'
import { evtMain } from 'AppEvents'
import CRDispatchManager from '../CRDispatchManager'
import {
  WB_MAILBOX_TAB_WEBCONTENTS_ATTACHED,
  WB_MAILBOX_TAB_WEBCONTENTES_DETACHED
} from 'shared/ipcEvents'
import {
  CRX_TABS_QUERY_,
  CRX_TABS_GET_,
  CRX_TABS_CREATED_,
  CRX_TABS_REMOVED_
} from 'shared/crExtensionIpcEvents'
import { MailboxesTabManager } from 'SessionManager'

class CRExtensionTabs {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.backgroundPageSender = null

    if (this.extension.manifest.hasBackground) {
      evtMain.on(WB_MAILBOX_TAB_WEBCONTENTS_ATTACHED, this.handleTabAttached)
      evtMain.on(WB_MAILBOX_TAB_WEBCONTENTES_DETACHED, this.handleTabDeatched)
    }

    CRDispatchManager.registerHandler(`${CRX_TABS_GET_}${this.extension.id}`, this.handleGetTab)
    CRDispatchManager.registerHandler(`${CRX_TABS_QUERY_}${this.extension.id}`, this.handleQueryTabs)
  }

  destroy () {
    evtMain.removeListener(WB_MAILBOX_TAB_WEBCONTENTS_ATTACHED, this.handleTabAttached)
    evtMain.removeListener(WB_MAILBOX_TAB_WEBCONTENTES_DETACHED, this.handleTabDeatched)

    CRDispatchManager.unregisterHandler(`${CRX_TABS_GET_}${this.extension.id}`, this.handleGetTab)
    CRDispatchManager.unregisterHandler(`${CRX_TABS_QUERY_}${this.extension.id}`, this.handleQueryTabs)
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * Generates the tab data from the given web contentsId depending on the permissions
  * @param webContentsId: the webcontent id to generate from
  * @return the raw tab data
  */
  _tabDataFromWebContentsId (webContentsId) {
    const wc = webContents.fromId(webContentsId)
    if (!wc || wc.isDestroyed()) {
      return { id: webContentsId }
    } else {
      return this._tabDataFromWebContents(wc)
    }
  }

  /**
  * Generates the tab data from the given web contents depending on the permissions
  * @param webContents: the webcontents to generate from
  * @return the raw tab data
  */
  _tabDataFromWebContents (webContents) {
    const window = BrowserWindow.fromWebContents(webContents.hostWebContents ? webContents.hostWebContents : webContents)
    return {
      id: webContents.id,
      windowId: window ? window.id : undefined,
      active: MailboxesTabManager.isMailboxTabActive(webContents),
      ...(this.extension.manifest.permissions.has('tabs') ? {
        url: webContents.getURL(),
        title: webContents.getTitle()
      } : undefined)
    }
  }

  /* ****************************************************************************/
  // Event listeners
  /* ****************************************************************************/

  /**
  * Handles a tab being attached by passing to the extension
  * @param webContentsId: the id of the webcontents
  */
  handleTabAttached = (webContentsId) => {
    if (!this.backgroundPageSender) { return }
    this.backgroundPageSender(`${CRX_TABS_CREATED_}${this.extension.id}`, this._tabDataFromWebContentsId(webContentsId))
  }

  /**
  * Handles a tab being detached by passing to the extension
  * @param webContentsId: the id of the webcontents
  */
  handleTabDeatched = (webContentsId) => {
    if (!this.backgroundPageSender) { return }
    this.backgroundPageSender(`${CRX_TABS_REMOVED_}${this.extension.id}`, this._tabDataFromWebContentsId(webContentsId))
  }

  /* ****************************************************************************/
  // Handlers
  /* ****************************************************************************/

  /**
  * Gets the tab with the given id
  * @param evt: the event that fired
  * @param [tabId]: the id of the tab
  * @param responseCallback: executed on completion
  */
  handleGetTab = (evt, [tabId], responseCallback) => {
    if (MailboxesTabManager.hasAttachedMailboxTab(tabId)) {
      responseCallback(null, this._tabDataFromWebContentsId(tabId))
    } else {
      responseCallback(null, null)
    }
  }

  /**
  * Queries the tabs
  * @param evt: the event that fired
  * @param [options]: the query info
  * @param responseCallback: executed on completion
  */
  handleQueryTabs = (evt, [options], responseCallback) => {
    const tabs = MailboxesTabManager.getAttachedMailboxTabs()
      .map((wc) => this._tabDataFromWebContents(wc))
      .filter((tab) => {
        if (options.active !== undefined) {
          if (tab.active !== options.active) { return false }
        }
        return true
      })

    responseCallback(null, tabs)
  }
}

export default CRExtensionTabs
