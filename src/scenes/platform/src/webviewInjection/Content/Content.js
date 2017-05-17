const injector = require('../injector')
const Browser = require('../Browser/Browser')
const WMail = require('../WMail/WMail')
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
    this.wmail = new WMail()

    injector.injectClientModule(path.join(__dirname, './client/ChromePatches.js'))
    injector.injectClientModule(path.join(__dirname, './client/WindowPatches.js'))

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
