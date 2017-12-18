import ExtensionLoader from './Extensions/ExtensionLoader'
import uuid from 'uuid'
import { ipcRenderer } from 'electron'
import { WCRPC_GUEST_CLOSE_WINDOW } from 'shared/webContentsRPC'

class WindowCloser {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.apiKey = uuid.v4()

    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.CONTENT_WINDOW, this.apiKey)

    window.addEventListener('message', (evt) => {
      if (evt.origin === window.location.origin && evt.isTrusted) {
        let data
        try {
          data = JSON.parse(evt.data)
        } catch (ex) { return }
        if (!data.wavebox) { return }
        if (data.apiKey !== this.apiKey) { return }

        if (data.type === 'WB_BROWSER_GUEST_WINDOW_CLOSE') {
          ipcRenderer.send(WCRPC_GUEST_CLOSE_WINDOW)
        }
      }
    })
  }
}

export default WindowCloser
