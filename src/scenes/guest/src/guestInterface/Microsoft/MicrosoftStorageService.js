const req = require('../req')
const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')
const injector = require('../injector')
const { WAVEBOX_GUEST_APIS } = req.shared('guestApis')

class MicrosoftStorageService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wavebox = new Wavebox()

    injector.injectWaveboxApi(WAVEBOX_GUEST_APIS.ONEDRIVE_WINDOW_OPEN)
  }
}

module.exports = MicrosoftStorageService
