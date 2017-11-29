const { webFrame } = require('electron')
const Browser = require('../Browser/Browser')

class GoogleService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()

    webFrame.insertCSS(`
      a[href*="/SignOutOptions"] {
        visibility: hidden !important;
      }
    `)
  }
}

module.exports = GoogleService
