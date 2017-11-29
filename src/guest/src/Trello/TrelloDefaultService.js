const Browser = require('../Browser/Browser')

class TrelloDefaultService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
  }
}

module.exports = TrelloDefaultService
