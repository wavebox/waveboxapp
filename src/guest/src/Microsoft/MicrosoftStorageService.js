const Browser = require('../Browser/Browser')
const Wavebox = require('../Wavebox/Wavebox')
const extensionLoader = require('../Extensions/extensionLoader')

class MicrosoftStorageService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wavebox = new Wavebox()

    extensionLoader.loadWaveboxGuestApi(extensionLoader.ENDPOINTS.ONEDRIVE_WINDOW_OPEN)
  }
}

module.exports = MicrosoftStorageService
