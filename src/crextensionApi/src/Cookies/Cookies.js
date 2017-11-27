import Event from 'Core/Event'
import DispatchManager from 'Core/DispatchManager'
import Cookie from './Cookie'
import { ipcRenderer } from 'electronCrx'
import {
  CRX_COOKIES_GET_,
  CRX_COOKIES_GET_ALL_,
  CRX_COOKIES_SET_,
  CRX_COOKIES_REMOVE_,
  CRX_COOKIES_CHANGED_
} from 'shared/crExtensionIpcEvents'
import { protectedHandleError } from 'Runtime/ProtectedRuntimeSymbols'

const privExtensionId = Symbol('privExtensionId')
const privRuntime = Symbol('privRuntime')

class Cookies {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/cookies
  * @param extensionId: the id of the extension
  * @param runtime: the current runtime
  */
  constructor (extensionId, runtime) {
    this[privExtensionId] = extensionId
    this[privRuntime] = runtime

    this.onChanged = new Event()

    // Handlers
    ipcRenderer.on(`${CRX_COOKIES_CHANGED_}${this[privExtensionId]}`, (evt, rawChangeInfo) => {
      const changeInfo = {
        cause: rawChangeInfo.cause,
        cookie: new Cookie(rawChangeInfo.cookie),
        removed: rawChangeInfo.removed
      }
      this.onChanged.emit(changeInfo)
    })

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Methods
  /* **************************************************************************/

  get (details, callback) {
    if (details.storeId) {
      console.warn('details.storeId is not supported by chrome.cookies.get at this time')
    }
    DispatchManager.request(
      `${CRX_COOKIES_GET_}${this[privExtensionId]}`,
      [details],
      (evt, err, response) => {
        if (callback) {
          callback(response ? new Cookie(response) : null)
        }
      }
    )
  }

  getAll (details, callback) {
    if (details.storeId) {
      console.warn('details.storeId is not supported by chrome.cookies.getAll at this time')
    }
    DispatchManager.request(
      `${CRX_COOKIES_GET_ALL_}${this[privExtensionId]}`,
      [details],
      (evt, err, response) => {
        if (callback) {
          const cookies = response.map((raw) => {
            return new Cookie(raw)
          })
          callback(cookies)
        }
      }
    )
  }

  set (details, callback) {
    if (details.storeId) {
      console.warn('details.storeId is not supported by chrome.cookies.set at this time')
    }
    DispatchManager.request(
      `${CRX_COOKIES_SET_}${this[privExtensionId]}`,
      [details],
      (evt, err, response) => {
        if (err) {
          this[privRuntime][protectedHandleError](err)
        }
        if (callback) {
          callback(response ? new Cookie(response) : null)
        }
      }
    )
  }

  remove (details, callback) {
    if (details.storeId) {
      console.warn('details.storeId is not supported by chrome.cookies.remove at this time')
    }
    DispatchManager.request(
      `${CRX_COOKIES_REMOVE_}${this[privExtensionId]}`,
      [details],
      (evt, err, response) => {
        if (callback) {
          callback(response)
        }
      }
    )
  }
}

export default Cookies
