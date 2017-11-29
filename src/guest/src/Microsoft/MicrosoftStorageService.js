const Browser = require('../Browser/Browser')
const extensionLoader = require('../Extensions/extensionLoader')

class MicrosoftStorageService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()

    extensionLoader.loadWaveboxGuestApi(extensionLoader.ENDPOINTS.ONEDRIVE_WINDOW_OPEN)
  }
}

module.exports = MicrosoftStorageService
