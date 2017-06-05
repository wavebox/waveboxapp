const injector = require('../injector')
const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')
const path = require('path')
const { ipcRenderer } = require('electron')

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

    injector.injectClientModule(path.join(__dirname, './Client/ChromePatches.js'))
    injector.injectClientModule(path.join(__dirname, './Client/WindowPatches.js'))

    window.addEventListener('message', (evt) => {
      if (evt.origin === window.location.origin && evt.isTrusted) {
        let data
        try {
          data = JSON.parse(evt.data)
        } catch (ex) { return }
        if (!data.wavebox) { return }

        if (data.type === 'guest-window-close') {
          ipcRenderer.sendToHost({ type: 'guest-window-close' })
        }
      }
    })
  }
}

module.exports = Content
