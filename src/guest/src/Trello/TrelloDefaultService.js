const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')

class TrelloDefaultService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wavebox = new Wavebox()
  }
}

module.exports = TrelloDefaultService
