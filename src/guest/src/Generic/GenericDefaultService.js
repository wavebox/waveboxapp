const Browser = require('../Browser/Browser')

class GenericDefaultService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
  }
}

module.exports = GenericDefaultService
