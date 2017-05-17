const Browser = require('../Browser/Browser')
const WMail = require('../WMail/WMail')

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
    this.wmail = new WMail()
  }
}

module.exports = GenericDefaultService
