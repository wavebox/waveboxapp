import { app } from 'electron'
import { settingsStore } from 'stores/settings'

const privForceQuit = Symbol('privForceQuit')
const privMainWindow = Symbol('privMainWindow')

class WaveboxAppCloseBehaviour {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privForceQuit] = false
    this[privMainWindow] = undefined
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get mainWindow () {
    return this[privMainWindow]
  }

  set mainWindow (w) {
    if (this[privMainWindow]) {
      this[privMainWindow].removeListener('close', this._handleMainWindowClose)
    }

    this[privMainWindow] = w
    if (this[privMainWindow]) {
      this[privMainWindow].on('close', this._handleMainWindowClose)
    }
  }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Handles the close event by trying to persist the mailbox window
  * @param evt: the event that occured
  */
  _handleMainWindowClose = (evt) => {
    if (!this[privForceQuit]) {
      const { tray } = settingsStore.getState()
      let hide = false

      if (process.platform === 'darwin') {
        if (this.mainWindow && this.mainWindow.isFullScreen()) {
          hide = false
        } else {
          hide = true
        }
      } else {
        if (tray.show) {
          hide = true
        }
      }

      if (hide) {
        this.mainWindow.hide()
        evt.preventDefault()
        this[privForceQuit] = false
      }
    }
  }

  /* ****************************************************************************/
  // Actioning
  /* ****************************************************************************/

  /**
  * Fully quits the app
  */
  fullyQuitApp = () => {
    this[privForceQuit] = true
    if (this[privMainWindow]) {
      this[privMainWindow].close()
    } else {
      app.quit()
    }
  }

  /**
  * Sets the force quit behavioru to be true
  */
  prepareForQuit = () => {
    this[privForceQuit] = true
  }

  /**
  * Quits the app and then starts it up again
  */
  restartApp = () => {
    app.relaunch()
    this.fullyQuitApp()
  }
}

export default WaveboxAppCloseBehaviour
