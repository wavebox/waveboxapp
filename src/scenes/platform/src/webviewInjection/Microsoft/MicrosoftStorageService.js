const Browser = require('../Browser/Browser')
const WMail = require('../WMail/WMail')
const injector = require('../injector')
const path = require('path')

class MicrosoftStorageService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wmail = new WMail()

    injector.injectClientModule(path.join(__dirname, './client/OnedriveWindowOpen.js'))
  }
}

module.exports = MicrosoftStorageService
