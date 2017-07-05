const { ipcRenderer } = require('electron')
const req = require('../req')
const GmailApi = require('./GmailApi')
const { WB_BROWSER_GOOGLE_GMAIL_UNREAD_COUNT_CHANGED } = req.shared('ipcEvents')

class GmailChangeEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.state = {
      count: GmailApi.getUnreadCount()
    }
    this.countInterval = setInterval(this.recheckCount.bind(this), 1000)
  }

  /* **************************************************************************/
  // Event Handlers
  /* **************************************************************************/

  /**
  * Handles gmail firing a http event by checking if the unread count has changed
  * and passing this event up across the bridge
  */
  recheckCount () {
    const nextCount = GmailApi.getUnreadCount()
    if (this.state.count !== nextCount) {
      ipcRenderer.sendToHost({
        type: WB_BROWSER_GOOGLE_GMAIL_UNREAD_COUNT_CHANGED,
        data: {
          trigger: 'http-event',
          prev: this.state.count,
          next: nextCount
        }
      })
      this.state.count = nextCount
    }
  }
}

module.exports = GmailChangeEmitter
