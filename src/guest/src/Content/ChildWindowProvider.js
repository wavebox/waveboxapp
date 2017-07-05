const extensionLoader = require('../Extensions/extensionLoader')
const req = require('../req')
const uuid = require('uuid')
const { ipcRenderer } = require('electron')
const { WB_BROWSER_GUEST_WINDOW_CLOSE } = req.shared('ipcEvents')
const { WAVEBOX_CONTENT_IMPL_ENDPOINTS } = req.shared('extensionApis')

class ChildWindowProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.apiKey = uuid.v4()

    extensionLoader.loadWaveboxGuestApi(WAVEBOX_CONTENT_IMPL_ENDPOINTS.CONTENT_WINDOW, this.apiKey)

    window.addEventListener('message', (evt) => {
      if (evt.origin === window.location.origin && evt.isTrusted) {
        let data
        try {
          data = JSON.parse(evt.data)
        } catch (ex) { return }
        if (!data.wavebox) { return }
        if (data.apiKey !== this.apiKey) { return }

        if (data.type === WB_BROWSER_GUEST_WINDOW_CLOSE) {
          ipcRenderer.sendToHost({ type: WB_BROWSER_GUEST_WINDOW_CLOSE })
        }
      }
    })
  }
}

module.exports = ChildWindowProvider
