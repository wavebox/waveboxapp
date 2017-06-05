const KeyboardNavigator = require('./KeyboardNavigator')
const Spellchecker = require('./Spellchecker')
const ContextMenu = require('./ContextMenu')
const Lifecycle = require('./Lifecycle')
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
    this.lifecycle = new Lifecycle()

    injector.injectClientModule(path.join(__dirname, './Client/Notification.js'))

    window.addEventListener('message', (evt) => {
      if (evt.origin === window.location.origin && evt.isTrusted) {
        let data
        try {
          data = JSON.parse(evt.data)
        } catch (ex) { return }
        if (!data.wavebox) { return }

        if (data.type === 'wavebox-notification-click') {
          ipcRenderer.sendToHost({ type: 'browser-notification-click' })
        } else if (data.type === 'wavebox-notification-present') {
          ipcRenderer.sendToHost({ type: 'browser-notification-present' })
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
