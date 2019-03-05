import { ipcMain, webContents } from 'electron'
import fs from 'fs-extra'
import Resolver from 'Runtime/Resolver'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import WaveboxWindow from 'Windows/WaveboxWindow'
import { accountStore, accountActions, ServiceDataReducer } from 'stores/account'
import {
  WB_GUEST_API_REQUEST,
  WB_GUEST_API_READ_SYNC,
  WB_GUEST_API_SEND_COMMAND
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
    ipcMain.on(WB_GUEST_API_SEND_COMMAND, this._handleGuestApiSendCommand)
  }

  /* ****************************************************************************/
  // Event handlers: Guest Api
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
  // Event handlers: Command Api
  /* ****************************************************************************/

  /**
  * Runs a service command in a webcontents
  * @param evt: the event that fired
  * @param wcId: the id of the webcontents to run in
  * @param serviceId: the id of the service to run in
  * @param commandString: the command string to run
  */
  _handleGuestApiSendCommand = (evt, wcId, serviceId, commandString) => {
    // Get the webcontents
    const target = webContents.fromId(wcId)
    if (!target || target.isDestroyed()) { return }

    // Check the tab info
    const tabInfo = WaveboxWindow.tabMetaInfo(wcId)
    if (!tabInfo) { return }
    if (tabInfo.backing !== WINDOW_BACKING_TYPES.MAILBOX_SERVICE) { return }
    if (tabInfo.serviceId !== serviceId) { return }

    // Get the service & command
    const service = accountStore.getState().getService(serviceId)
    if (!service) { return }
    const command = service.getCommandForString(commandString)
    if (!command) { return }

    // Build our JS
    const argsString = commandString.substr(command.modifier.length + command.keyword.length).trim()
    const execJS = !command.js
      ? undefined
      : `
        ;(function (modifier, keyword, args, fullCommand) {
          ${command.js}
        })(...${JSON.stringify([command.modifier, command.keyword, argsString, commandString])})
      `

    // Build our URL
    const targetUrl = command.url
      ? command.url.replace(/{{args}}/g, encodeURIComponent(argsString))
      : undefined
    let urlIsSame = true
    if (targetUrl) {
      try {
        urlIsSame = new URL(targetUrl).toString() === new URL(target.getURL()).toString()
      } catch (ex) {
        urlIsSame = false
      }
    }

    // Run the command based on current state
    if (targetUrl && !urlIsSame) {
      target.loadURL(targetUrl)
      if (execJS) {
        target.once('dom-ready', () => {
          target.executeJavaScript(execJS)
        })
      }
    } else {
      if (execJS) {
        if (target.isLoadingMainFrame()) {
          target.once('dom-ready', () => {
            target.executeJavaScript(execJS)
          })
        } else {
          target.executeJavaScript(execJS)
        }
      }
    }
  }

  /* ****************************************************************************/
  // Data Utils
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
  // Guest Api Calls
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
