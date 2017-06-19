const injector = require('../injector')
const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')
const req = require('../req')
const { ipcRenderer } = require('electron')
const { WB_BROWSER_GUEST_WINDOW_CLOSE } = req.shared('ipcEvents')
const { WAVEBOX_GUEST_APIS } = req.shared('guestApis')

class Content {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser({
      contextMenu: {
        copyCurrentPageUrlOption: true,
        openCurrentPageInBrowserOption: true
      }
    })
    this.wavebox = new Wavebox()

    injector.injectWaveboxApi(WAVEBOX_GUEST_APIS.CONTENT_WINDOW)

    window.addEventListener('message', (evt) => {
      if (evt.origin === window.location.origin && evt.isTrusted) {
        let data
        try {
          data = JSON.parse(evt.data)
        } catch (ex) { return }
        if (!data.wavebox) { return }

        if (data.type === WB_BROWSER_GUEST_WINDOW_CLOSE) {
          ipcRenderer.sendToHost({ type: WB_BROWSER_GUEST_WINDOW_CLOSE })
        }
      }
    })
  }
}

module.exports = Content
