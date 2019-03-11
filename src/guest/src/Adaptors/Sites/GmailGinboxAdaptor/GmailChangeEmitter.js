import { ipcRenderer } from 'electron'
import GmailApi from './GmailApi'
import uuid from 'uuid'
import { ExtensionLoader } from 'Browser'
import {
  WB_BROWSER_GOOGLE_GMAIL_UNREAD_COUNT_CHANGED,
  WB_BROWSER_GOOGLE_GMAIL_ARCHIVE_FIRING
} from 'shared/ipcEvents'

const CHANGE_CHECK_INTERVAL = 1000
const CHANGE_TRANSMIT_WAIT = 750
const ARCHIVE_TRANSMIT_THROTTLE = 2500

class GmailChangeEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.apiKey = uuid.v4()
    this.state = {
      count: GmailApi.getUnreadCount()
    }
    this.countInterval = setInterval(this.recheckCount, CHANGE_CHECK_INTERVAL)
    this.archiveFiringThrottle = null

    window.addEventListener('message', this.handleWindowMessage)
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.GOOGLE_MAIL_HTTP_WATCHER, this.apiKey)
  }

  /* **************************************************************************/
  // Event Handlers
  /* **************************************************************************/

  /**
  * Handles gmail firing a http event by checking if the unread count has changed
  * and passing this event up across the bridge
  */
  recheckCount = () => {
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

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  /**
  * Handles a new window message
  * @param evt: the event that fired
  */
  handleWindowMessage = (evt) => {
    if (evt.origin === window.location.origin && evt.isTrusted) {
      let data
      try {
        data = JSON.parse(evt.data)
      } catch (ex) { return }
      if (!data.wavebox) { return }
      if (data.apiKey !== this.apiKey) { return }

      if (data.type === 'wavebox-gmail-http-request-archive-firing') {
        clearTimeout(this.archiveFiringThrottle)
        this.archiveFiringThrottle = setTimeout(() => {
          ipcRenderer.sendToHost({
            type: WB_BROWSER_GOOGLE_GMAIL_ARCHIVE_FIRING,
            data: {}
          })
        }, ARCHIVE_TRANSMIT_THROTTLE)
      }
    }
  }
}

export default GmailChangeEmitter
