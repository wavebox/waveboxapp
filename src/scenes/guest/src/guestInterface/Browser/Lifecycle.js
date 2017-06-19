const { ipcRenderer } = require('electron')
const req = require('../req')
const injector = require('../injector')
const {
  WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_SLEEP,
  WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_AWAKEN
} = req.shared('ipcEvents')

class Lifecycle {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.sleeping = false
    this.sleepStyleElement = null

    ipcRenderer.on(WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_SLEEP, this.sleep.bind(this))
    ipcRenderer.on(WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_AWAKEN, this.awaken.bind(this))
    injector.injectHeadFunction(this.updateState.bind(this))
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  /**
  * Updates the state of
  */
  updateState () {
    if (this.sleeping) {
      this.sleep()
    } else {
      this.awaken()
    }
  }

  /**
  * Sleeps the current page
  */
  sleep () {
    this.sleeping = true

    if (!document.head) { return }

    if (!this.sleepStyleElement) {
      this.sleepStyleElement = document.createElement('style')
      this.sleepStyleElement.innerHTML = `
        img[src*=".gif"] { visibility: hidden !important; }
      `
      document.head.appendChild(this.sleepStyleElement)
    }
  }

  /**
  * Wakes the current page
  */
  awaken () {
    this.sleeping = false

    if (!document.head) { return }

    if (this.sleepStyleElement) {
      this.sleepStyleElement.parentElement.removeChild(this.sleepStyleElement)
      this.sleepStyleElement = null
    }
  }
}

module.exports = Lifecycle
