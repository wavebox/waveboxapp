const { remote } = require('electron')
const CustomCode = require('./CustomCode')
const environment = remote.getCurrentWebContents().getType()

class Wavebox {
  constructor () {
    if (environment === 'webview') {
      this.customCode = new CustomCode()
    }
  }
}

module.exports = Wavebox
