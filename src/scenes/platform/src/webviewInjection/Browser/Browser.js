const KeyboardNavigator = require('./KeyboardNavigator')
const Spellchecker = require('./Spellchecker')
const ContextMenu = require('./ContextMenu')
const injector = require('../injector')
const path = require('path')
const { ipcRenderer } = require('electron')

class Browser {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param config={}: configuration for the different elements. Keys can include:
  *                     contextMenu
  */
  constructor (config = {}) {
    this.keyboardNavigator = new KeyboardNavigator()
    this.spellchecker = new Spellchecker()
    this.contextMenu = new ContextMenu(this.spellchecker, config.contextMenu)

    injector.injectClientModule(path.join(__dirname, './client/Notification.js'))

    window.addEventListener('message', (evt) => {
      if (evt.origin === window.location.origin && evt.isTrusted) {
        let data
        try {
          data = JSON.parse(evt.data)
        } catch (ex) { return }
        if (!data.wavebox) { return }

        if (data.type === 'wavebox-notification-click') {
          ipcRenderer.sendToHost({ type: 'browser-notification-click' })
        }
      }
    })

    ipcRenderer.on('ping-resource-usage', (evt, data) => {
      ipcRenderer.sendToHost({
        type: 'pong-resource-usage',
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

module.exports = Browser
