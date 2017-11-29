const { webFrame } = require('electron')
const Browser = require('../Browser/Browser')

class TrelloDefaultService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()

    webFrame.insertCSS(`
      #macssb1_banner { display:none; }
    `)
  }
}

module.exports = TrelloDefaultService
