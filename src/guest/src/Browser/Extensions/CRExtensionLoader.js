import { webFrame, ipcRenderer } from 'electron'
import { EventEmitter } from 'events'

const privHasLoaded = Symbol('privHasLoaded')

class CRExtensionLoader extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()
    this[privHasLoaded] = false
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Loads the extension
  */
  load () {
    if (this[privHasLoaded]) { return }
    this[privHasLoaded] = true

    process.electronBinding('KRXFramework').connectGuest({
      webFrame: webFrame,
      ipcRenderer: ipcRenderer
    })
    process.electronBinding('KRXFramework').on('extension-start', (...args) => this.emit('start', ...args))
  }
}

export default CRExtensionLoader
