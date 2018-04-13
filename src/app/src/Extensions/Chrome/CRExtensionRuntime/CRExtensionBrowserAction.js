import { ipcMain, webContents } from 'electron'
import CRDispatchManager from '../CRDispatchManager'
import CRExtensionTab from './CRExtensionTab'
import {
  CRX_BROWSER_ACTION_SET_TITLE_,
  CRX_BROWSER_ACTION_FETCH_TITLE_,
  CRX_BROWSER_ACTION_SET_ICON_,
  CRX_BROWSER_ACTION_SET_POPUP_,
  CRX_BROWSER_ACTION_FETCH_POPUP_,
  CRX_BROWSER_ACTION_SET_BADGE_TEXT_,
  CRX_BROWSER_ACTION_FETCH_BADGE_TEXT_,
  CRX_BROWSER_ACTION_SET_BADGE_BACKGROUND_COLOR_,
  CRX_BROWSER_ACTION_FETCH_BADGE_BACKGROUND_COLOR_,
  CRX_BROWSER_ACTION_ENABLE_,
  CRX_BROWSER_ACTION_DISABLE_,
  CRX_BROWSER_ACTION_CLICKED_
} from 'shared/crExtensionIpcEvents'
import {
  CR_EXTENSION_PROTOCOL
} from 'shared/extensionApis'
import {
  CRExtensionRTBrowserAction
} from 'shared/Models/CRExtensionRT'
import ContentWindow from 'Windows/ContentWindow'
import CRExtensionBackgroundPage from './CRExtensionBackgroundPage'
import { evtMain } from 'AppEvents'
import {crextensionActions} from 'stores/crextension'

class CRExtensionBrowserAction {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.browserActions = new Map()

    ipcMain.on(`${CRX_BROWSER_ACTION_SET_TITLE_}${this.extension.id}`, this.handleSetTitle)
    CRDispatchManager.registerHandler(`${CRX_BROWSER_ACTION_FETCH_TITLE_}${this.extension.id}`, this.handleFetchTitle)
    CRDispatchManager.registerHandler(`${CRX_BROWSER_ACTION_SET_ICON_}${this.extension.id}`, this.handleSetIcon)
    ipcMain.on(`${CRX_BROWSER_ACTION_SET_POPUP_}${this.extension.id}`, this.handleSetPopup)
    CRDispatchManager.registerHandler(`${CRX_BROWSER_ACTION_FETCH_POPUP_}${this.extension.id}`, this.handleFetchPopup)
    ipcMain.on(`${CRX_BROWSER_ACTION_SET_BADGE_TEXT_}${this.extension.id}`, this.handleSetBadgeText)
    CRDispatchManager.registerHandler(`${CRX_BROWSER_ACTION_FETCH_BADGE_TEXT_}${this.extension.id}`, this.handleFetchBadgeText)
    ipcMain.on(`${CRX_BROWSER_ACTION_SET_BADGE_BACKGROUND_COLOR_}${this.extension.id}`, this.handleSetBadgeBackgroundColor)
    CRDispatchManager.registerHandler(`${CRX_BROWSER_ACTION_FETCH_BADGE_BACKGROUND_COLOR_}${this.extension.id}`, this.handleFetchBadgeBackgroundColor)
    ipcMain.on(`${CRX_BROWSER_ACTION_ENABLE_}${this.extension.id}`, this.handleEnable)
    ipcMain.on(`${CRX_BROWSER_ACTION_DISABLE_}${this.extension.id}`, this.handleDisable)

    evtMain.on(`${evtMain.WBECRX_BROWSER_ACTION_CLICKED_}${this.extension.id}`, this.handleClick)

    // Populate from the extension
    if (extension.manifest.hasBrowserAction) {
      this._loadFromManifest(extension.manifest.browserAction)
    }
  }

  destroy () {
    ipcMain.removeListener(`${CRX_BROWSER_ACTION_SET_TITLE_}${this.extension.id}`, this.handleSetTitle)
    CRDispatchManager.unregisterHandler(`${CRX_BROWSER_ACTION_FETCH_TITLE_}${this.extension.id}`, this.handleFetchTitle)
    CRDispatchManager.unregisterHandler(`${CRX_BROWSER_ACTION_SET_ICON_}${this.extension.id}`, this.handleSetIcon)
    ipcMain.removeListener(`${CRX_BROWSER_ACTION_SET_POPUP_}${this.extension.id}`, this.handleSetPopup)
    CRDispatchManager.unregisterHandler(`${CRX_BROWSER_ACTION_FETCH_POPUP_}${this.extension.id}`, this.handleFetchPopup)
    ipcMain.removeListener(`${CRX_BROWSER_ACTION_SET_BADGE_TEXT_}${this.extension.id}`, this.handleSetBadgeText)
    CRDispatchManager.unregisterHandler(`${CRX_BROWSER_ACTION_FETCH_BADGE_TEXT_}${this.extension.id}`, this.handleFetchBadgeText)
    ipcMain.removeListener(`${CRX_BROWSER_ACTION_SET_BADGE_BACKGROUND_COLOR_}${this.extension.id}`, this.handleSetBadgeBackgroundColor)
    CRDispatchManager.unregisterHandler(`${CRX_BROWSER_ACTION_FETCH_BADGE_BACKGROUND_COLOR_}${this.extension.id}`, this.handleFetchBadgeBackgroundColor)
    ipcMain.removeListener(`${CRX_BROWSER_ACTION_ENABLE_}${this.extension.id}`, this.handleEnable)
    ipcMain.removeListener(`${CRX_BROWSER_ACTION_DISABLE_}${this.extension.id}`, this.handleDisable)

    evtMain.removeListener(`${evtMain.WBECRX_BROWSER_ACTION_CLICKED_}${this.extension.id}`, this.handleClick)
  }

  /* ****************************************************************************/
  // Data utils
  /* ****************************************************************************/

  /**
  * Loads the settings in from the manifest
  * @param browserAction: the browser action in the manifest
  */
  _loadFromManifest (browserAction) {
    const update = {}
    if (browserAction.defaultTitle) {
      update.title = browserAction.defaultTitle
    }
    if (browserAction.defaultIcon) {
      update.icon = {
        path: Object.keys(browserAction.defaultIcon).reduce((acc, size) => {
          acc[size] = `${CR_EXTENSION_PROTOCOL}://${this.extension.id}/${browserAction.defaultIcon[size]}`
          return acc
        }, {})
      }
    }
    if (browserAction.defaultPopup) {
      update.popup = browserAction.defaultPopup
    }

    this._updateBrowserAction(undefined, update, false)
  }

  /**
  * Updates a browser action
  * @param tabId=undefined: the id of the tab
  * @param changes: an object of changes to merge in
  * @param emitChange=true: false to not emit changes
  */
  _updateBrowserAction (tabId = undefined, changes, emitChange = true) {
    if (!this.browserActions.has(tabId)) {
      this.browserActions.set(tabId, new CRExtensionRTBrowserAction(this.extensionId, tabId, {}))
    }

    const prev = this.browserActions.get(tabId)
    const nextJS = prev.changeData(changes)
    const next = new CRExtensionRTBrowserAction(this.extensionId, tabId, nextJS)
    this.browserActions.set(tabId, next)

    // Send the change to any ui components
    if (emitChange && this.extension.manifest.hasBrowserAction) {
      crextensionActions.browserActionChanged.defer(this.extension.id, tabId, nextJS)
    }
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * Builds the runtime data for the ui
  * @return the browser actions in a plain json object
  */
  buildUIRuntimeData () {
    return Array.from(this.browserActions.keys())
      .reduce((acc, tabId) => {
        const tab = this.browserActions.get(tabId)
        if (tab.isGlobal) {
          acc.global = tab.cloneData()
        } else {
          acc.tabs[tab.id] = tab.cloneData()
        }
        return acc
      }, { global: undefined, tabs: {} })
  }

  /* ****************************************************************************/
  // Handlers: Appearance
  /* ****************************************************************************/

  /**
  * Sets the title
  * @param evt: the event that fired
  * @param {title, tabId}
  */
  handleSetTitle = (evt, { title, tabId = undefined }) => {
    this._updateBrowserAction(tabId, { title })
  }

  /**
  * Fetches the title
  * @param evt: the event that fired
  * @param [tabId]
  * @param responseCallback: executed on completion
  */
  handleFetchTitle = (evt, [{tabId = undefined}], responseCallback) => {
    responseCallback(null, [(this.browserActions.get(tabId) || {}).title])
  }

  /**
  * Sets the icon
  * @param evt: the event that fired
  * @param {[imageData, path, tabId]}
  * @param responseCallback: executed on completion
  */
  handleSetIcon = (evt, [{ imageData, path, tabId = undefined }], responseCallback) => {
    this._updateBrowserAction(tabId, { icon: {imageData, path} })
    responseCallback(null, [])
  }

  /* ****************************************************************************/
  // Handlers: Popup
  /* ****************************************************************************/

  /**
  * Sets the popup
  * @param evt: the event that fired
  * @param {popup, tabId}
  */
  handleSetPopup = (evt, { popup, tabId = undefined }) => {
    this._updateBrowserAction(tabId, { popup })
  }

  /**
  * Fetches the popup
  * @param evt: the event that fired
  * @param {[imageData, path, tabId]}
  * @param responseCallback: executed with the popup
  */
  handleFetchPopup = (evt, [{ tabId = undefined }], responseCallback) => {
    responseCallback(null, [(this.browserActions.get(tabId) || {}).popup])
  }

  /* ****************************************************************************/
  // Handlers: Badge
  /* ****************************************************************************/

  /**
  * Sets the badge text
  * @param evt: the event that fired
  * @param { text, tabId }
  */
  handleSetBadgeText = (evt, { text, tabId = undefined }) => {
    this._updateBrowserAction(tabId, { badgeText: text })
  }

  /**
  * Fetches the badge text
  * @param evt: the event that fired
  * @param {[imageData, path, tabId]}
  * @param responseCallback: executed with the popup
  */
  handleFetchBadgeText = (evt, [{ tabId = undefined }], responseCallback) => {
    responseCallback(null, [(this.browserActions.get(tabId) || {}).badgeText])
  }

  /**
  * Sets the badge background color
  * @param evt: the event that fired
  * @param { color, tabId }
  */
  handleSetBadgeBackgroundColor = (evt, { color, tabId = undefined }) => {
    this._updateBrowserAction(tabId, { badgeBackgroundColor: color })
  }

  /**
  * Fetches the badge background color
  * @param evt: the event that fired
  * @param {[imageData, path, tabId]}
  * @param responseCallback: executed with the popup
  */
  handleFetchBadgeBackgroundColor = (evt, [{ tabId = undefined }], responseCallback) => {
    responseCallback(null, [(this.browserActions.get(tabId) || {}).badgeBackgroundColor])
  }

  /* ****************************************************************************/
  // Handlers: Enabling
  /* ****************************************************************************/

  /**
  * Enables the action
  * @param evt: the event that fired
  * @param tabId: the tabId
  */
  handleEnable = (evt, tabId = undefined) => {
    this._updateBrowserAction(tabId, { enabled: true })
  }

  /**
  * Disable the action
  * @param evt: the event that fired
  * @param tabId: the tabId
  */
  handleDisable = (evt, tabId = undefined) => {
    this._updateBrowserAction(tabId, { enabled: false })
  }

  /* ****************************************************************************/
  // Handlers: Interaction
  /* ****************************************************************************/

  /**
  * Handles the browser action being clicked
  * @param evt: the event that fired
  * @param tabId: the id of the tab
  */
  handleClick = (evt, tabId) => {
    if (this.extension.manifest.wavebox.hasBrowserActionOpenUrl) {
      const contentWindow = new ContentWindow()
      contentWindow.create(
        this.extension.manifest.wavebox.browserActionOpenUrl,
        undefined,
        undefined,
        {
          partition: CRExtensionBackgroundPage.partitionIdForExtension(this.extension.id)
        }
      )
    } else {
      const tabInfo = CRExtensionTab.dataFromWebContentsId(this.extension, tabId)
      webContents.getAllWebContents().forEach((targetWebcontents) => {
        targetWebcontents.send(`${CRX_BROWSER_ACTION_CLICKED_}${this.extension.id}`, tabInfo)
      })
    }
  }

  /**
  * @param tabId: the id of the tab
  */
  browserActionClicked (tabId) {
    this.handleClick({}, tabId)
  }
}

export default CRExtensionBrowserAction
