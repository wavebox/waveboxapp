const { remote, webFrame } = require('electron')
const req = require('../req')
const CustomCode = require('./CustomCode')
const environment = remote.getCurrentWebContents().getType()
const { WAVEBOX_GUEST_APIS_PROTOCOL } = req.shared('guestApis')

class Wavebox {
  constructor () {
    webFrame.registerURLSchemeAsPrivileged(WAVEBOX_GUEST_APIS_PROTOCOL)
    if (environment === 'webview') {
      this.customCode = new CustomCode()
    }
  }
}

module.exports = Wavebox
