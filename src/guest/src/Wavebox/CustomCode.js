const { ipcRenderer, webFrame } = require('electron')
const req = require('../req')
const { WB_BROWSER_INJECT_CUSTOM_CONTENT } = req.shared('ipcEvents')

class CustomCode {
  constructor () {
    ipcRenderer.on(WB_BROWSER_INJECT_CUSTOM_CONTENT, this._handleInject_.bind(this))
  }

  _handleInject_ (evt, data) {
    if (data.js) {
      webFrame.executeJavaScript(data.js)
    }
    if (data.css) {
      webFrame.insertCSS(data.css)
    }
  }
}

module.exports = CustomCode
