const { ipcRenderer, remote } = require('electron')
const injector = require('../injector')
const { WB_BROWSER_INJECT_CUSTOM_CONTENT } = remote.require('./shared/ipcEvents')

class CustomCode {
  constructor () {
    ipcRenderer.on(WB_BROWSER_INJECT_CUSTOM_CONTENT, this._handleInject_.bind(this))
  }

  _handleInject_ (evt, data) {
    if (data.js) {
      injector.injectJavaScript(data.js)
    }
    if (data.css) {
      injector.injectStyle(data.css)
    }
  }
}

module.exports = CustomCode
