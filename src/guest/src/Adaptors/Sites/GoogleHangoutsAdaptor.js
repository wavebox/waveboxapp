import BaseAdaptor from './BaseAdaptor'
import { ipcRenderer } from 'electron'
import { WB_BROWSER_GOOGLE_COMMUNICATION_UNREAD_COUNT_CHANGED } from 'shared/ipcEvents'

const NOTIFICATION_CHANGE_CHECK_INTERVAL = 1500
const privState = Symbol('privState')
const privNotificationInterval = Symbol('privNotificationInterval')

class GoogleHangoutsAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://hangouts.google.com(*)'
    ]
  }
  static get hasJS () { return true }

  /* **************************************************************************/
  // JS
  /* **************************************************************************/

  constructor () {
    super()

    this[privState] = {
      count: undefined
    }
  }

  executeJS () {
    this[privNotificationInterval] = setInterval(this._checkNewNotifications, NOTIFICATION_CHANGE_CHECK_INTERVAL)
  }

  /* **************************************************************************/
  // Change listeners
  /* **************************************************************************/

  /**
  * Checks for new notifications
  */
  _checkNewNotifications = () => {
    const { count } = this._getUnreadInfo()
    if (count !== this[privState].count) {
      ipcRenderer.sendToHost({
        type: WB_BROWSER_GOOGLE_COMMUNICATION_UNREAD_COUNT_CHANGED,
        data: {
          prev: this[privState].count,
          next: count
        }
      })
    }
    this[privState].count = count
  }

  /* **************************************************************************/
  // DOM Api
  /* **************************************************************************/

  /**
  * @return the unread info. { count }
  */
  _getUnreadInfo () {
    const info = { count: undefined }

    try {
      const chatFrame = document.querySelector('#hangout-landing-chat iframe').contentWindow.document.body

      try {
        info.count = chatFrame.querySelectorAll('.ee').length
      } catch (ex) { }
    } catch (ex) {}

    return info
  }
}

export default GoogleHangoutsAdaptor
