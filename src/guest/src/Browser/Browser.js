const { ipcRenderer, remote } = require('electron')
const req = require('../req')
const KeyboardNavigator = require('./KeyboardNavigator')
const Spellchecker = require('./Spellchecker')
const ContextMenu = require('./ContextMenu')
const Lifecycle = require('./Lifecycle')
const NotificationProvider = require('./NotificationProvider')
const environment = remote.getCurrentWebContents().getType()
const extensionLoader = require('../Extensions/extensionLoader')
const { CRExtensionLoader } = require('../Extensions')
const {
  WB_PING_RESOURCE_USAGE,
  WB_PONG_RESOURCE_USAGE
} = req.shared('ipcEvents')

class Browser {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param config={}: configuration for the different elements. Keys can include:
  *                     contextMenu
  */
  constructor (config = {}) {
    extensionLoader.loadWaveboxGuestApi(extensionLoader.ENDPOINTS.CHROME)
    CRExtensionLoader.load()
    this.keyboardNavigator = new KeyboardNavigator()
    this.spellchecker = new Spellchecker()
    this.contextMenu = new ContextMenu(this.spellchecker, config.contextMenu)
    this.notificationProvider = new NotificationProvider()

    // Some tools are only exposed in nested webviews
    if (environment === 'webview') {
      this.lifecycle = new Lifecycle()

      ipcRenderer.on(WB_PING_RESOURCE_USAGE, (evt, data) => {
        ipcRenderer.sendToHost({
          type: WB_PONG_RESOURCE_USAGE,
          data: Object.assign({},
            process.getCPUUsage(),
            process.getProcessMemoryInfo(),
            {
              pid: process.pid,
              description: data.description
            }
          )
        })
      })
    }
  }
}

module.exports = Browser
