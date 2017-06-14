const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')
const injector = require('../injector')

class TrelloDefaultService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wavebox = new Wavebox()

    injector.injectStyle(`
      #macssb1_banner { display:none; }
    `)
  }
}

module.exports = TrelloDefaultService
