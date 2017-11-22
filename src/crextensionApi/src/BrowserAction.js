import { ipcRenderer } from 'electronCrx'
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
import DispatchManager from 'Core/DispatchManager'
import Event from 'Core/Event'
import Tab from 'Tabs/Tab'

const privExtensionId = Symbol('privExtensionId')

class BrowserAction {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/browserAction
  * @param extensionId: the id of the extension
  */
  constructor (extensionId) {
    this[privExtensionId] = extensionId
    this.onClicked = new Event()

    ipcRenderer.on(`${CRX_BROWSER_ACTION_CLICKED_}${extensionId}`, (evt, tabInfo) => {
      this.onClicked.emit(new Tab(tabInfo))
    })
    Object.freeze(this)
  }

  /* **************************************************************************/
  // Title & Icon
  /* **************************************************************************/

  setTitle (details) {
    ipcRenderer.send(`${CRX_BROWSER_ACTION_SET_TITLE_}${this[privExtensionId]}`, details)
  }

  getTitle (details, callback) {
    DispatchManager.request(`${CRX_BROWSER_ACTION_FETCH_TITLE_}${this[privExtensionId]}`, [details], (evt, err, response) => {
      callback(response ? response[0] : undefined)
    })
  }

  setIcon (details, callback = undefined) {
    DispatchManager.request(`${CRX_BROWSER_ACTION_SET_ICON_}${this[privExtensionId]}`, [details], (evt, err, response) => {
      if (callback) {
        callback(response ? response[0] : undefined)
      }
    })
  }

  /* **************************************************************************/
  // Popup
  /* **************************************************************************/

  setPopup (details) {
    ipcRenderer.send(`${CRX_BROWSER_ACTION_SET_POPUP_}${this[privExtensionId]}`, details)
  }

  getPopup (details, callback) {
    DispatchManager.request(`${CRX_BROWSER_ACTION_FETCH_POPUP_}${this[privExtensionId]}`, [details], (evt, err, response) => {
      callback(response ? response[0] : undefined)
    })
  }

  /* **************************************************************************/
  // Badge
  /* **************************************************************************/

  setBadgeText (details) {
    ipcRenderer.send(`${CRX_BROWSER_ACTION_SET_BADGE_TEXT_}${this[privExtensionId]}`, details)
  }

  getBadgeText (details, callback) {
    DispatchManager.request(`${CRX_BROWSER_ACTION_FETCH_BADGE_TEXT_}${this[privExtensionId]}`, [details], (evt, err, response) => {
      callback(response ? response[0] : undefined)
    })
  }

  setBadgeBackgroundColor (details) {
    ipcRenderer.send(`${CRX_BROWSER_ACTION_SET_BADGE_BACKGROUND_COLOR_}${this[privExtensionId]}`, details)
  }

  getBadgeBackgroundColor (details, callback) {
    DispatchManager.request(`${CRX_BROWSER_ACTION_FETCH_BADGE_BACKGROUND_COLOR_}${this[privExtensionId]}`, [details], (evt, err, response) => {
      callback(response ? response[0] : undefined)
    })
  }

  /* **************************************************************************/
  // Enable / Disable
  /* **************************************************************************/

  enable (tabId = undefined) {
    ipcRenderer.send(`${CRX_BROWSER_ACTION_ENABLE_}${this[privExtensionId]}`, tabId)
  }

  disable (tabId = undefined) {
    ipcRenderer.send(`${CRX_BROWSER_ACTION_DISABLE_}${this[privExtensionId]}`, tabId)
  }
}

export default BrowserAction
