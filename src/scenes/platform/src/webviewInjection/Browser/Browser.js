const KeyboardNavigator = require('./KeyboardNavigator')
const Spellchecker = require('./Spellchecker')
const ContextMenu = require('./ContextMenu')
const Lifecycle = require('./Lifecycle')
const NotificationProvider = require('./NotificationProvider')
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
    this.notificationProvider = new NotificationProvider()
    this.lifecycle = new Lifecycle()

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
