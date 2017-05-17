const KeyboardNavigator = require('./KeyboardNavigator')
const Spellchecker = require('./Spellchecker')
const ContextMenu = require('./ContextMenu')
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
