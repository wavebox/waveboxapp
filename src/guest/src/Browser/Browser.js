const KeyboardNavigator = require('./KeyboardNavigator')
const Spellchecker = require('./Spellchecker')
const Lifecycle = require('./Lifecycle')
const NotificationProvider = require('./NotificationProvider')
const extensionLoader = require('../Extensions/extensionLoader')
const { CRExtensionLoader } = require('../Extensions')
const CustomCode = require('./CustomCode')

class Browser {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    extensionLoader.loadWaveboxGuestApi(extensionLoader.ENDPOINTS.CHROME)
    CRExtensionLoader.load()

    this.keyboardNavigator = new KeyboardNavigator()
    this.spellchecker = new Spellchecker()
    this.notificationProvider = new NotificationProvider()
    this.customCode = new CustomCode()
    this.lifecycle = new Lifecycle()
  }
}

module.exports = Browser
