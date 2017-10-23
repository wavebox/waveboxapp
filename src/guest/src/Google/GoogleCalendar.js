const GoogleService = require('./GoogleService')
const { ipcRenderer, remote } = require('electron')
const req = require('../req')
const extensionLoader = require('../Extensions/extensionLoader')
const { WB_BROWSER_GOOGLE_CALENDAR_ALERT_PRESENTED } = req.shared('ipcEvents')
const uuid = require('uuid')

class GoogleCalendar extends GoogleService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()
    this.apiKey = uuid.v4()
    window.addEventListener('message', this.handleWindowMessage.bind(this))
    extensionLoader.loadWaveboxGuestApi(extensionLoader.ENDPOINTS.GOOGLE_CALENDAR_ALERT, this.apiKey)
  }

  /* **************************************************************************/
  // Message handling
  /* **************************************************************************/

  /**
  * Handles a new window message
  * @param evt: the event that fired
  */
  handleWindowMessage (evt) {
    if (evt.origin === window.location.origin && evt.isTrusted) {
      let data
      try {
        data = JSON.parse(evt.data)
      } catch (ex) { return }
      if (!data.wavebox) { return }
      if (data.apiKey !== this.apiKey) { return }

      if (data.type === 'wavebox-alert-present') {
        const browserWindow = remote.getCurrentWindow()
        remote.dialog.showMessageBox(browserWindow, {
          type: 'none',
          message: data.message
        })
        ipcRenderer.sendToHost({
          type: WB_BROWSER_GOOGLE_CALENDAR_ALERT_PRESENTED,
          data: { message: data.message }
        })
      }
    }
  }
}

module.exports = GoogleCalendar
