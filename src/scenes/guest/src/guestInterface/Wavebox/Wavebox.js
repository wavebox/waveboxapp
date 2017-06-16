const { remote, webFrame } = require('electron')
const CustomCode = require('./CustomCode')
const environment = remote.getCurrentWebContents().getType()
const { WAVEBOX_GUEST_APIS_PROTOCOL } = remote.require('./shared/guestApis')

class Wavebox {
  constructor () {
    webFrame.registerURLSchemeAsPrivileged(WAVEBOX_GUEST_APIS_PROTOCOL)
    if (environment === 'webview') {
      this.customCode = new CustomCode()
    }
  }
}

module.exports = Wavebox
