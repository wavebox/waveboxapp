import { ipcMain } from 'electron'
import fs from 'fs-extra'
import Resolver from 'Runtime/Resolver'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import WaveboxWindow from 'Windows/WaveboxWindow'
import { accountActions, ServiceDataReducer } from 'stores/account'
import {
  WB_GUEST_API_REQUEST,
  WB_GUEST_API_READ_SYNC
} from 'shared/ipcEvents'
import {
  VALID_WAVEBOX_CONTENT_IMPL_ENDPOINTS
} from 'shared/extensionApis'

const privCachedGuestAPIs = Symbol('privCachedGuestAPIs')

class WBGApiService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privCachedGuestAPIs] = new Map()

    ipcMain.on(WB_GUEST_API_REQUEST, this._handleGuestApiRequest)
    ipcMain.on(WB_GUEST_API_READ_SYNC, this._handleGuestApiReadSync)
  }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Handles a new guest api request
  * @param evt: the event that fired
  * @param name: the method name
  * @param args: the args to call with the fn
  */
  _handleGuestApiRequest = (evt, name, args) => {
    const tabInfo = WaveboxWindow.tabMetaInfo(evt.sender.id)
    if (!tabInfo) { return }
    if (tabInfo.backing !== WINDOW_BACKING_TYPES.MAILBOX_SERVICE) { return }

    switch (name) {
      case 'badge:setCount':
        return this._setBadgeCount(tabInfo.serviceId, ...args)
      case 'badge:setHasUnreadActivity':
        return this._setBadgeHasUnreadActivity(tabInfo.serviceId, ...args)
      case 'tray:setMessages':
        return this._setTrayMessages(tabInfo.serviceId, ...args)
    }
  }

  /**
  * Loads a guest api from disk
  * @param evt: the event that fired
  * @param name: the name of the api
  */
  _handleGuestApiReadSync = (evt, name) => {
    try {
      if (!VALID_WAVEBOX_CONTENT_IMPL_ENDPOINTS.has(name)) {
        evt.returnValue = null
        return
      }

      if (!this[privCachedGuestAPIs].has(name)) {
        const code = fs.readFileSync(Resolver.guestApi(name), 'utf8')
        this[privCachedGuestAPIs].set(name, code)
      }

      evt.returnValue = this[privCachedGuestAPIs].get(name)
    } catch (ex) {
      console.error('Failed to respond to "WB_GUEST_API_READ_SYNC" continuing with unkown side effects', ex)
      evt.returnValue = null
    }
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  _shapeInt (val, defVal = 0) {
    return typeof (val) === 'number' ? parseInt(val) : defVal
  }

  _shapeBool (val, defVal = false) {
    return typeof (val) === 'boolean' ? val : defVal
  }

  _shapeStr (val, defVal = '', maxLength = Infinity) {
    const safeVal = typeof (val) === 'string' ? val : defVal
    if (maxLength !== Infinity) {
      return typeof (safeVal) === 'string' ? safeVal.substr(0, maxLength) : safeVal
    } else {
      return safeVal
    }
  }

  /* ****************************************************************************/
  // Api Calls
  /* ****************************************************************************/

  _setBadgeCount (serviceId, unsafeCount) {
    accountActions.reduceServiceData(
      serviceId,
      ServiceDataReducer.setWbgapiUnreadCount,
      this._shapeInt(unsafeCount, 0)
    )
  }

  _setBadgeHasUnreadActivity (serviceId, unsafeHasActivity) {
    accountActions.reduceServiceData(
      serviceId,
      ServiceDataReducer.setWbgapiHasUnreadActivity,
      this._shapeBool(unsafeHasActivity, false)
    )
  }

  _setTrayMessages (serviceId, unsafeMessages) {
    const messages = (Array.isArray(unsafeMessages) ? unsafeMessages : [])
      .slice(0, 10)
      .map((unsafeMessage, index) => {
        return {
          id: this._shapeStr(unsafeMessage.id || `auto_${index}`, `auto_${index}`, 100),
          text: this._shapeStr(unsafeMessage.text, 100),
          date: this._shapeInt(unsafeMessage.date, new Date().getTime()),
          data: {
            serviceId: serviceId,
            open: this._shapeStr(unsafeMessage.open, '', 256)
          }
        }
      })
    accountActions.reduceServiceData(
      serviceId,
      ServiceDataReducer.setWbgapiTrayMessages,
      messages
    )
  }
}

export default WBGApiService
