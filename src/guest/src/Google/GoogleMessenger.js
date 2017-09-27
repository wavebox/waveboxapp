const GoogleService = require('./GoogleService')
const {ipcRenderer} = require('electron')
const req = require('../req')
const { WB_BROWSER_GOOGLE_MESSENGER_UNREAD_COUNT_CHANGED } = req.shared('ipcEvents')
const NOTIFICATION_CHANGE_CHECK_INTERVAL = 1500

class GoogleCommunication extends GoogleService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()
    this.state = {
      count: undefined
    }
    this.notificationInterval = setInterval(this.checkUnreadCountChanged.bind(this), NOTIFICATION_CHANGE_CHECK_INTERVAL)
  }

  /* **************************************************************************/
  // Change listeners
  /* **************************************************************************/

  /**
  * Checks to see if the unread count has changed
  */
  checkUnreadCountChanged () {
    const count = this.getUnreadCount()
    if (count !== this.state.count) {
      ipcRenderer.sendToHost({
        type: WB_BROWSER_GOOGLE_MESSENGER_UNREAD_COUNT_CHANGED,
        data: {
          prev: this.state.count,
          next: count
        }
      })
    }
    this.state.count = count
  }

  /* **************************************************************************/
  // DOM Api
  /* **************************************************************************/

  /**
  * @return the unread count
  */
  getUnreadCount () {
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

module.exports = GoogleCommunication
