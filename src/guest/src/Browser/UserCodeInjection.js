import { ipcRenderer, webFrame } from 'electron'
import { WB_BROWSER_INJECT_CUSTOM_CONTENT } from 'shared/ipcEvents'

class UserCodeInjection {
  constructor () {
    ipcRenderer.on(WB_BROWSER_INJECT_CUSTOM_CONTENT, this._handleInject)
  }

  _handleInject = (evt, data) => {
    if (data.js) {
      webFrame.executeJavaScript(data.js)
    }
    if (data.css) {
      webFrame.insertCSS(data.css)
    }
  }
}

export default UserCodeInjection
