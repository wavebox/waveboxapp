import { ipcMain } from 'electron'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import WaveboxWindow from 'Windows/WaveboxWindow'
import { mailboxStore, mailboxActions, ServiceReducer } from 'stores/mailbox'
import {
  WB_GUEST_API_REQUEST
} from 'shared/ipcEvents'

/**
* @Thomas101 there is some refactoring to be done here when we move over to our
* multi-process stores. Write the data directly from here rather than bouncing down
* to the mailboxes window
*/
class GuestApiService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_GUEST_API_REQUEST, this._handleGuestApiRequest)
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

    const mailbox = mailboxStore.getState().getMailbox(tabInfo.mailboxId)
    if (!mailbox) { return }
    const service = mailbox.serviceForType(tabInfo.serviceType)
    if (!service) { return }
    if (!service.supportsGuestConfig) { return }

    switch (name) {
      case 'badge:setCount':
        return this._setBadgeCount(tabInfo.mailboxId, tabInfo.serviceType, ...args)
      case 'badge:setHasUnreadActivity':
        return this._setBadgeHasUnreadActivity(tabInfo.mailboxId, tabInfo.serviceType, ...args)
      case 'tray:setMessages':
        return this._setTrayMessages(tabInfo.mailboxId, tabInfo.serviceType, ...args)
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

  _setBadgeCount (mailboxId, serviceType, unsafeCount) {
    mailboxActions.reduceService(
      mailboxId,
      serviceType,
      ServiceReducer.setAdaptorUnreadCount,
      this._shapeInt(unsafeCount, 0)
    )
  }

  _setBadgeHasUnreadActivity (mailboxId, serviceType, unsafeHasActivity) {
    mailboxActions.reduceService(
      mailboxId,
      serviceType,
      ServiceReducer.setAdaptorHasUnreadActivity,
      this._shapeBool(unsafeHasActivity, false)
    )
  }

  _setTrayMessages (mailboxId, serviceType, unsafeMessages) {
    const messages = (Array.isArray(unsafeMessages) ? unsafeMessages : [])
      .slice(0, 10)
      .map((unsafeMessage, index) => {
        return {
          id: this._shapeStr(unsafeMessage.id || `auto_${index}`, `auto_${index}`, 100),
          text: this._shapeStr(unsafeMessage.text, 100),
          date: this._shapeInt(unsafeMessage.date, new Date().getTime()),
          data: {
            mailboxId: mailboxId,
            serviceType: serviceType,
            open: this._shapeStr(unsafeMessage.open, '', 256)
          }
        }
      })
    mailboxActions.reduceService(
      mailboxId,
      serviceType,
      ServiceReducer.setAdaptorTrayMessages,
      messages
    )
  }
}

export default GuestApiService
