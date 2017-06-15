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
        openCurrentPageInBrowserOption: true,

        navigateBackOption: true,
        navigateForwardOption: true,
        navigateHomeOption: true,
        navigateReloadOption: true
      }
    })
    this.wavebox = new Wavebox()
  }
}

module.exports = GenericDefaultService
