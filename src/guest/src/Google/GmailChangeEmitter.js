const { ipcRenderer } = require('electron')
const req = require('../req')
const GmailApi = require('./GmailApi')
const { WB_BROWSER_GOOGLE_GMAIL_UNREAD_COUNT_CHANGED } = req.shared('ipcEvents')
const CHANGE_CHECK_INTERVAL = 1000
const CHANGE_TRANSMIT_WAIT = 750

class GmailChangeEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.state = {
      count: GmailApi.getUnreadCount()
    }
    this.countInterval = setInterval(this.recheckCount.bind(this), CHANGE_CHECK_INTERVAL)
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
      const prevCount = this.state.count
      this.state.count = nextCount
      setTimeout(() => {
        ipcRenderer.sendToHost({
          type: WB_BROWSER_GOOGLE_GMAIL_UNREAD_COUNT_CHANGED,
          data: {
            trigger: 'http-event',
            prev: prevCount,
            next: nextCount
          }
        })
      }, CHANGE_TRANSMIT_WAIT)
    }
  }
}

module.exports = GmailChangeEmitter
