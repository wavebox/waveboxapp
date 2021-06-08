import BaseAdaptor from './BaseAdaptor'
import { ipcRenderer } from 'electron'
import { WB_BROWSER_GOOGLE_MESSENGER_UNREAD_COUNT_CHANGED } from 'shared/ipcEvents'

const NOTIFICATION_CHANGE_CHECK_INTERVAL = 1500
const privState = Symbol('privState')
const privNotificationInterval = Symbol('privNotificationInterval')

class GoogleAlloAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://allo.google.com(*)'
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
    this[privNotificationInterval] = setInterval(this._checkUnreadCountChanged, NOTIFICATION_CHANGE_CHECK_INTERVAL)
  }

  /* **************************************************************************/
  // Change listeners
  /* **************************************************************************/

  /**
  * Checks to see if the unread count has changed
  */
  _checkUnreadCountChanged = () => {
    const count = this._getUnreadCount()
    if (count !== this[privState].count) {
      ipcRenderer.sendToHost({
        type: WB_BROWSER_GOOGLE_MESSENGER_UNREAD_COUNT_CHANGED,
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
  * @return the unread count
  */
  _getUnreadCount () {
    const elements = document.querySelectorAll('#conversationsView .conversation_item.hasUnread')
    return Array.from(elements).reduce((acc, el) => {
      const countEl = el.querySelector('.unreadCount')
      if (countEl) {
        const messageCount = parseInt(countEl.textContent)
        if (!isNaN(messageCount)) {
          return acc + messageCount
        }
      }
      return acc + 1
    }, 0)
  }
}

export default GoogleAlloAdaptor
