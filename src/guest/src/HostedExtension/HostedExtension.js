const Browser = require('../Browser/Browser')
const { webFrame } = require('electron')
const req = require('../req')
const {
  WAVEBOX_HOSTED_EXTENSION_PROTOCOL
} = req.shared('extensionApis')

class HostedExtension {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    webFrame.registerURLSchemeAsPrivileged(WAVEBOX_HOSTED_EXTENSION_PROTOCOL)
    this.browser = new Browser({
      contextMenu: {
        hasSettingsOption: false,
        hasChangeDictionaryOption: false
      }
    })
  }
}

module.exports = HostedExtension
