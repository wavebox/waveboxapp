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
  CRX_BROWSER_ACTION_CLICKED_,
  CRX_BROWSER_ACTION_OPEN_POPUP_,
  CRX_BROWSER_ACTION_CREATE_FROM_BG_
} from 'shared/crExtensionIpcEvents'
import DispatchManager from 'Core/DispatchManager'
import Event from 'Core/Event'
import Tab from 'Tabs/Tab'
import uuid from 'uuid'
import { protectedJSWindowTracker } from 'Runtime/ProtectedRuntimeSymbols'

const privExtensionId = Symbol('privExtensionId')
const privRuntime = Symbol('privRuntime')
const privRuntimeEnvironment = Symbol('privRuntimeEnvironment')

class BrowserAction {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/browserAction
  * @param extensionId: the id of the extension
  * @param runtimeEnvironment: the current runtime environment
  * @param runtime: the runtime object we proxy some requests through for
  */
  constructor (extensionId, runtimeEnvironment, runtime) {
    this[privExtensionId] = extensionId
    this[privRuntimeEnvironment] = runtimeEnvironment
    this[privRuntime] = runtime

    this.onClicked = new Event()

    ipcRenderer.on(`${CRX_BROWSER_ACTION_CLICKED_}${extensionId}`, (evt, tabInfo) => {
      this.onClicked.emit(new Tab(tabInfo))
    })
    ipcRenderer.on(`${CRX_BROWSER_ACTION_OPEN_POPUP_}${extensionId}`, (evt, tabId, url) => {
      const transId = uuid.v4()
      ipcRenderer.send(`${CRX_BROWSER_ACTION_CREATE_FROM_BG_}${extensionId}`, transId, tabId, url)
      const opened = window.open(url)
      ipcRenderer.once(`${CRX_BROWSER_ACTION_CREATE_FROM_BG_}${extensionId}${transId}`, (evt, err, tabData) => {
        if (tabData) {
          this[privRuntime][protectedJSWindowTracker].add(tabData.id, 'popup', opened)
        }
      })
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
