import { ipcRenderer } from 'electron'
import uuid from 'uuid'
import { WB_GUEST_API_REQUEST } from 'shared/ipcEvents'
import ExtensionLoader from './Extensions/ExtensionLoader'
import pkg from 'package.json'

class WaveboxApiProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.apiKey = uuid.v4()

    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.WAVEBOX_API, this.apiKey, {
      appVersion: pkg.version
    })
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

      if (data.type === 'wavebox-api') {
        ipcRenderer.send(WB_GUEST_API_REQUEST, data.name, data.args)
      }
    }
  }
}

export default WaveboxApiProvider
