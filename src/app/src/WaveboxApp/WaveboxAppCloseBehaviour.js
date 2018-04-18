import { app } from 'electron'
import { settingsStore } from 'stores/settings'
import fs from 'fs-extra'
import path from 'path'

const privForceQuit = Symbol('privForceQuit')
const privMainWindow = Symbol('privMainWindow')
const privIsInAppTeardown = Symbol('privIsInAppTeardown')

class WaveboxAppCloseBehaviour {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privForceQuit] = false
    this[privIsInAppTeardown] = false
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
  // Platform interface
  /* ****************************************************************************/

  /**
  * Checks if the app is pinned to the taskbar
  * @return true if pinned, false otherwise
  */
  isPinnedToWin32Taskbar () {
    if (process.platform !== 'win32') { return false }

    const pinnedQuicklaunchPath = path.join(app.getPath('appData'), 'Microsoft/Internet Explorer/Quick Launch/User Pinned/TaskBar')
    let quickLaunchShortcutNames
    try {
      quickLaunchShortcutNames = fs.readdirSync(pinnedQuicklaunchPath)
    } catch (ex) {
      return false
    }

    const match = quickLaunchShortcutNames.find((filename) => {
      const ext = path.extname(filename)
      const name = filename.substr(0, filename.length - ext.length)
      return name.trim().toLowerCase() === 'wavebox'
    })

    return !!match
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
      if (!this.mainWindow) { return }

      const { tray } = settingsStore.getState()
      if (process.platform === 'darwin') {
        if (!this.mainWindow.isFullScreen()) {
          this._hideMainWindowOnClose(evt)
        }
      } else if (process.platform === 'win32') {
        if (tray.show) {
          if (this.isPinnedToWin32Taskbar()) {
            this._minimizeMainWindowOnClose(evt)
          } else {
            this._hideMainWindowOnClose(evt)
          }
        }
      } else {
        if (tray.show) {
          this._hideMainWindowOnClose(evt)
        }
      }
    }
  }

  /**
  * Hides the main window on close and prevents quit
  * @param evt: the event that fired from the close event
  */
  _hideMainWindowOnClose = (evt) => {
    this.mainWindow.hide()
    evt.preventDefault()
    this[privForceQuit] = false
  }

  /**
  * Minimizes the main window on close and prevents quit
  * @param evt: the event that fired from the close event
  */
  _minimizeMainWindowOnClose = (evt) => {
    this.mainWindow.minimize()
    evt.preventDefault()
    this[privForceQuit] = false
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
      this.safeQuitApp()
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

  /* ****************************************************************************/
  // Safe Quit
  /* ****************************************************************************/

  /**
  * Runs app.quit() but checks if the app is in the teardown step
  * @return true if the quit is called in this instance
  */
  safeQuitApp = () => {
    if (this[privIsInAppTeardown] === false) {
      app.quit()
      return true
    } else {
      return false
    }
  }

  /**
  * Sets that the app is in the teardown stage
  */
  setAppInTeardownStage = () => {
    this[privIsInAppTeardown] = true
  }
}

export default WaveboxAppCloseBehaviour
