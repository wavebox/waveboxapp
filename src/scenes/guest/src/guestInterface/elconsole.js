const { ipcRenderer } = require('electron')
const req = require('./req')
const {
  WB_BROWSER_ELEVATED_LOG,
  WB_BROWSER_ELEVATED_ERROR
} = req.shared('ipcEvents')

class ELConsole {
  /**
  * Logs the supplied arguments and also logs them to the parent frame
  */
  log () {
    ipcRenderer.sendToHost({
      type: WB_BROWSER_ELEVATED_LOG,
      messages: Array.from(arguments)
    })
    console.log.apply(this, Array.from(arguments))
  }

  /**
  * Logs the supplied arguments as errors and also logs them to the parent frame
  */
  error () {
    ipcRenderer.sendToHost({
      type: WB_BROWSER_ELEVATED_ERROR,
      messages: Array.from(arguments)
    })
    console.error.apply(this, Array.from(arguments))
  }
}

module.exports = new ELConsole()
