import { ipcRenderer } from 'electron'
import uuid from 'uuid'
import { WB_BROWSER_ALERT_PRESENT, WB_BROWSER_CONFIRM_PRESENT } from 'shared/ipcEvents'
import ExtensionLoader from './Extensions/ExtensionLoader'

class DialogProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.apiKey = uuid.v4()

    console.log("HERE")
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.WINDOW_DIALOGS, this.apiKey, {})
    console.log("HERE2")
    window.addEventListener('message', this.handleWindowMessage)
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

      if (data.type === 'wavebox-alert-present') {
        ipcRenderer.sendToHost({ type: WB_BROWSER_ALERT_PRESENT })
      } else if (data.type === 'wavebox-confirm-present') {
        ipcRenderer.sendToHost({ type: WB_BROWSER_CONFIRM_PRESENT })
      }
    }
  }
}

export default DialogProvider
