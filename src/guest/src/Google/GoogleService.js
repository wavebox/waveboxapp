const { webFrame } = require('electron')
const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')

class GoogleService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wavebox = new Wavebox()

    webFrame.insertCSS(`
      a[href*="/SignOutOptions"] {
        visibility: hidden !important;
      }
    `)
  }
}

module.exports = GoogleService
