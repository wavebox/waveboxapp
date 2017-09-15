const Browser = require('../../Browser/Browser')

class CRExtensionOptions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
  }
}

module.exports = CRExtensionOptions
