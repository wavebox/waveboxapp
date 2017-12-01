import { ipcRenderer } from 'electron'
import {
  WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_SLEEP,
  WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_AWAKEN
} from 'shared/ipcEvents'
import { WCRPC_DOM_READY } from 'shared/webContentsRPC'

const privSleeping = Symbol('privSleeping')
const privSleepStyleElement = Symbol('privSleepStyleElement')

class Lifecycle {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privSleeping] = false
    this[privSleepStyleElement] = null

    ipcRenderer.on(WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_SLEEP, this.sleep)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_WEBVIEW_LIFECYCLE_AWAKEN, this.awaken)
    ipcRenderer.on(WCRPC_DOM_READY, this.updateState)
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  /**
  * Updates the state of
  */
  updateState = () => {
    if (this[privSleeping]) {
      this.sleep()
    } else {
      this.awaken()
    }
  }

  /**
  * Sleeps the current page
  */
  sleep = () => {
    this[privSleeping] = true

    if (!document.head) { return }

    if (!this[privSleepStyleElement]) {
      this[privSleepStyleElement] = document.createElement('style')
      this[privSleepStyleElement].innerHTML = `
        img[src*=".gif"] { visibility: hidden !important; }
      `
      document.head.appendChild(this[privSleepStyleElement])
    }
  }

  /**
  * Wakes the current page
  */
  awaken = () => {
    this[privSleeping] = false

    if (!document.head) { return }

    if (this[privSleepStyleElement]) {
      this[privSleepStyleElement].parentElement.removeChild(this[privSleepStyleElement])
      this[privSleepStyleElement] = null
    }
  }
}

export default Lifecycle
