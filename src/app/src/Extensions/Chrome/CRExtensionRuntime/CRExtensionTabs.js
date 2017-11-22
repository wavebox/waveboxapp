import { BrowserWindow, webContents } from 'electron'
import { evtMain } from 'AppEvents'
import CRDispatchManager from '../CRDispatchManager'
import {
  CRX_TABS_QUERY_,
  CRX_TABS_GET_,
  CRX_TABS_CREATED_,
  CRX_TABS_REMOVED_,
  CRX_TAB_ACTIVATED_,
  CRX_TAB_UPDATED_,
  CRX_TAB_EXECUTE_SCRIPT_
} from 'shared/crExtensionIpcEvents'
import {
  WBECRX_EXECUTE_SCRIPT
} from 'shared/ipcEvents'
import WaveboxWindow from 'windows/WaveboxWindow'
import CRExtensionMatchPatterns from 'shared/Models/CRExtension/CRExtensionMatchPatterns'
import url from 'url'

class CRExtensionTabs {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.backgroundPageSender = null

    if (this.extension.manifest.hasBackground) {
      evtMain.on(evtMain.WB_TAB_CREATED, this.handleTabCreated)
      evtMain.on(evtMain.WB_TAB_DESTROYED, this.handleTabDestroyed)
      evtMain.on(evtMain.WB_TAB_ACTIVATED, this.handleTabActivated)
    }

    CRDispatchManager.registerHandler(`${CRX_TABS_GET_}${this.extension.id}`, this.handleGetTab)
    CRDispatchManager.registerHandler(`${CRX_TABS_QUERY_}${this.extension.id}`, this.handleQueryTabs)
    CRDispatchManager.registerHandler(`${CRX_TAB_EXECUTE_SCRIPT_}${this.extension.id}`, this.handleExecuteScript)
  }

  destroy () {
    evtMain.removeListener(evtMain.WB_TAB_CREATED, this.handleTabCreated)
    evtMain.removeListener(evtMain.WB_TAB_DESTROYED, this.handleTabDestroyed)
    evtMain.removeListener(evtMain.WB_TAB_ACTIVATED, this.handleTabActivated)

    CRDispatchManager.unregisterHandler(`${CRX_TABS_GET_}${this.extension.id}`, this.handleGetTab)
    CRDispatchManager.unregisterHandler(`${CRX_TABS_QUERY_}${this.extension.id}`, this.handleQueryTabs)
    CRDispatchManager.unregisterHandler(`${CRX_TAB_EXECUTE_SCRIPT_}${this.extension.id}`, this.handleExecuteScript)
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
    const browserWindow = BrowserWindow.fromWebContents(webContents.hostWebContents ? webContents.hostWebContents : webContents)
    const waveboxWindow = browserWindow ? WaveboxWindow.fromBrowserWindowId(browserWindow.id) : undefined

    return {
      id: webContents.id,
      ...(browserWindow && !browserWindow.isDestroyed() ? {
        windowId: browserWindow.id
      } : undefined),
      ...(waveboxWindow ? {
        active: waveboxWindow.focusedTabId() === webContents.id
      } : undefined),
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
  * @param tabId: the id of the webcontents
  */
  handleTabCreated = (tabId) => {
    // Bind tab listeners - even if there isn't a sender right now
    this.bindTabEventListeners(tabId)

    // Send the events down
    if (!this.backgroundPageSender) { return }
    this.backgroundPageSender(`${CRX_TABS_CREATED_}${this.extension.id}`, this._tabDataFromWebContentsId(tabId))
  }

  /**
  * Handles a tab being detached by passing to the extension
  * @param tabId: the id of the webcontents
  */
  handleTabDestroyed = (tabId) => {
    if (!this.backgroundPageSender) { return }
    this.backgroundPageSender(`${CRX_TABS_REMOVED_}${this.extension.id}`, this._tabDataFromWebContentsId(tabId))
  }

  /**
  * Handles a tab being activated
  * @param browserWindowId: the id of the browser window
  * @param tabId: the id of the tab
  */
  handleTabActivated = (browserWindowId, tabId) => {
    if (!this.backgroundPageSender) { return }
    this.backgroundPageSender(`${CRX_TAB_ACTIVATED_}${this.extension.id}`, {
      windowId: browserWindowId,
      tabId: tabId
    })
  }

  /**
  * Binds the tab event listeners if permissions allow
  * @param tabId: the tab id to bind to
  */
  bindTabEventListeners = (tabId) => {
    if (!this.extension.manifest.permissions.has('tabs')) { return }
    const contents = webContents.fromId(tabId)
    if (!contents) { return }

    contents.on('page-title-updated', (evt, title) => {
      if (!this.backgroundPageSender) { return }
      this.backgroundPageSender(`${CRX_TAB_UPDATED_}${this.extension.id}`, tabId, {
        title: title
      }, this._tabDataFromWebContentsId(tabId))
    })
    contents.on('did-navigate', (evt, url) => {
      if (!this.backgroundPageSender) { return }
      this.backgroundPageSender(`${CRX_TAB_UPDATED_}${this.extension.id}`, tabId, {
        url: url
      }, this._tabDataFromWebContentsId(tabId))
    })
    contents.on('did-navigate-in-page', (evt, url, isMainFrame) => {
      if (!isMainFrame) { return }
      if (!this.backgroundPageSender) { return }
      this.backgroundPageSender(`${CRX_TAB_UPDATED_}${this.extension.id}`, tabId, {
        url: url
      }, this._tabDataFromWebContentsId(tabId))
    })
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
    if (WaveboxWindow.fromTabId(tabId)) {
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
    const lastFocusedWindowId = WaveboxWindow.lastFocusedId()
    const hasTabsPermission = this.extension.manifest.permissions.has('tabs')

    const tabs = WaveboxWindow.allTabIds()
      .map((id) => this._tabDataFromWebContentsId(id))
      .filter((tab) => {
        if (!tab) { return false }

        if (options.active !== undefined) {
          if (tab.active !== options.active) { return false }
        }
        if (options.windowId !== undefined) {
          if (tab.windowId !== options.windowId) { return false }
        }
        if (options.lastFocusedWindow === true) {
          if (lastFocusedWindowId === undefined || tab.windowId !== lastFocusedWindowId) { return false }
        }
        if (options.currentWindow === true) { // Not quite true - but close enough
          if (lastFocusedWindowId === undefined || tab.windowId !== lastFocusedWindowId) { return false }
        }

        if (hasTabsPermission) {
          if (typeof (options.url) === 'string' || Array.isArray(options.url)) {
            const urlQuery = typeof (options.url) === 'string' ? [options.url] : options.url
            const purl = url.parse(tab.url)
            const matches = CRExtensionMatchPatterns.matchUrls(
              purl.protocol,
              purl.hostname,
              purl.pathname,
              urlQuery
            )
            if (!matches) { return false }
          }
        }

        return true
      })

    responseCallback(null, tabs)
  }

  /**
  * Handles executing a script in another tab
  * @param evt: the event that fired
  * @param [tabId, details]: the exec info
  * @param responseCallback: executed on completion
  */
  handleExecuteScript = (evt, [tabId, details], responseCallback) => {
    // Add defaults in late during execution step
    tabId = tabId === undefined ? WaveboxWindow.focusedTabId() : tabId

    if (!WaveboxWindow.fromTabId(tabId)) { // Do the check on the window to ensure we can't get bg page etc
      responseCallback(`Tab not found with id "${tabId}"`, null)
      return
    }

    const contents = webContents.fromId(tabId)
    const purl = url.parse(contents.getURL())
    const matches = CRExtensionMatchPatterns.matchUrls(
      purl.protocol,
      purl.hostname,
      purl.pathname,
      Array.from(this.extension.manifest.permissions)
    )
    if (!matches) {
      responseCallback(`Permissions do not allow execution on tab with id "${tabId}"`, null)
      return
    }

    CRDispatchManager.requestOnTarget(
      contents,
      WBECRX_EXECUTE_SCRIPT,
      [this.extension.id, details],
      (evt, err, response) => {
        responseCallback(err, response)
      }
    )
  }
}

export default CRExtensionTabs
