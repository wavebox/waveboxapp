import BaseAdaptor from './BaseAdaptor'
import uuid from 'uuid'
import { ExtensionLoader } from 'Browser'
import { ipcRenderer } from 'electron'
import { WB_BROWSER_GOOGLE_CALENDAR_ALERT_PRESENTED } from 'shared/ipcEvents'
import { WCRPC_SHOW_ASYNC_MESSAGE_DIALOG } from 'shared/webContentsRPC'

const privApiKey = Symbol('privApiKey')

class GoogleCalendarAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () { return ['*://calendar.google.com*'] }
  static get hasJS () { return true }

  /* **************************************************************************/
  // JS
  /* **************************************************************************/

  executeJS () {
    this[privApiKey] = uuid.v4()
    window.addEventListener('message', this._handleWindowMessage)
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.GOOGLE_CALENDAR_ALERT, this[privApiKey])
  }

  /* **************************************************************************/
  // Message handling
  /* **************************************************************************/

  /**
  * Handles a new window message
  * @param evt: the event that fired
  */
  _handleWindowMessage = (evt) => {
    if (evt.origin === window.location.origin && evt.isTrusted) {
      let data
      try {
        data = JSON.parse(evt.data)
      } catch (ex) { return }
      if (!data.wavebox) { return }
      if (data.apiKey !== this[privApiKey]) { return }

      if (data.type === 'wavebox-alert-present') {
        ipcRenderer.send(WCRPC_SHOW_ASYNC_MESSAGE_DIALOG, {
          type: 'none',
          message: `${data.message}`,
          buttons: ['OK']
        })
        ipcRenderer.sendToHost({
          type: WB_BROWSER_GOOGLE_CALENDAR_ALERT_PRESENTED,
          data: { message: data.message }
        })
      }
    }
  }
}

export default GoogleCalendarAdaptor
