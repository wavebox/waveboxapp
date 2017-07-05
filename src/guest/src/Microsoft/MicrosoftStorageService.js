const req = require('../req')
const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')
const extensionLoader = require('../Extensions/extensionLoader')
const { WAVEBOX_CONTENT_IMPL_ENDPOINTS } = req.shared('extensionApis')

class MicrosoftStorageService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wavebox = new Wavebox()

    extensionLoader.loadWaveboxGuestApi(WAVEBOX_CONTENT_IMPL_ENDPOINTS.ONEDRIVE_WINDOW_OPEN)
  }
}

module.exports = MicrosoftStorageService
