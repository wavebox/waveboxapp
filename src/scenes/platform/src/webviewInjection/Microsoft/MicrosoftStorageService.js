const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')
const injector = require('../injector')
const path = require('path')

class MicrosoftStorageService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wavebox = new Wavebox()

    injector.injectClientModule(path.join(__dirname, './Client/OnedriveWindowOpen.js'))
  }
}

module.exports = MicrosoftStorageService
