const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')

class GenericDefaultService {
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
    this.wavebox = new Wavebox()
  }
}

module.exports = GenericDefaultService
