const { webFrame } = require('electron')
const Browser = require('../Browser/Browser')

class GoogleStorage {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()

    webFrame.insertCSS(`
      a[href*="/SignOutOptions"] {
        visibility: hidden !important;
      }
      .g-Yd.a-la-B.a-Ff-B.g-Yd-Ya.g-Yd-Na { /* Turn on notifications popup */
        display: none !important;
      }
    `)
  }
}

module.exports = GoogleStorage
