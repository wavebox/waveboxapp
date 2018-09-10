import { BrowserWindow, screen } from 'electron'
import Resolver from 'Runtime/Resolver'
import Positioner from 'electron-positioner'
import { settingsStore } from 'stores/settings'
import WaveboxWindow from 'Windows/WaveboxWindow'
import {
  POPOUT_POSITIONS
} from 'shared/Models/Settings/TraySettings'
import { WB_TRAY_WINDOWED_MODE_CHANGED } from 'shared/ipcEvents'

const privWindow = Symbol('privWindow')
const privPositioner = Symbol('privPositioner')
const privHideTO = Symbol('privHideTO')
const privIsWindowMode = Symbol('privIsWindowMode')

class TrayPopout {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privWindow] = undefined
    this[privPositioner] = undefined
    this[privIsWindowMode] = false
  }

  /**
  * Loads the tray
  */
  load () {
    if (this.isLoaded) { return }

    // Configure state
    this[privIsWindowMode] = false

    // Create window
    this[privWindow] = new BrowserWindow({
      width: 450,
      height: 500,
      minWidth: 300,
      minHeight: 300,
      show: false,
      backgroundColor: '#ffffff',
      transparent: false,
      maximizable: false,
      fullscreenable: false,
      title: 'Wavebox Mini',
      icon: (() => {
        if (process.platform === 'win32') { return Resolver.icon('app.ico') }
        if (process.platform === 'linux') { return Resolver.icon('app.png') }
        return undefined
      })(),
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: false,
        webviewTag: false
      },
      ...(!this.isWindowedMode ? {
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        movable: false,
        resizable: false
      } : undefined)
    })
    this[privWindow].setMenuBarVisibility(false)

    // Bind window events
    this[privPositioner] = new Positioner(this[privWindow])
    this[privWindow].webContents.on('will-navigate', (evt, url) => evt.preventDefault())
    this[privWindow].on('blur', this._handleBlur)
    this[privWindow].on('focus', this._handleFocus)
    this[privWindow].on('close', this._handleClose)
    this[privWindow].on('closed', this._handleClosed)
    this[privWindow].loadURL(`file://${Resolver.traypopoutScene('popout.html')}`)

    // Add us into the manager
    if (this.isWindowedMode) {
      WaveboxWindow.attachSpecial(this[privWindow].id)
    }
  }

  /**
  * Destorys the window
  */
  unload () {
    if (!this.isLoaded) { return }

    WaveboxWindow.detachSpecial(this[privWindow].id)
    // Most of the teardown happens in closed event
    this[privWindow].removeListener('close', this._handleClose)
    this[privWindow].close()
  }

  /* ****************************************************************************/
  // Lifecycle: Events
  /* ****************************************************************************/

  /**
  * Handles the window being closed
  */
  _handleClosed = (evt) => {
    // Tear down state
    this[privWindow] = undefined
    this[privPositioner] = undefined
    this[privIsWindowMode] = false
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isLoaded () { return this[privWindow] && !this[privWindow].isDestroyed() }
  get webContentsId () { return this.isLoaded ? this[privWindow].webContents.id : undefined }
  get isVisible () { return this.isLoaded && this[privWindow].isVisible() && !this[privWindow].isMinimized() }
  get isWindowedMode () { return this[privIsWindowMode] }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  _throwIfNotLoaded () {
    if (!this.isLoaded) { throw new Error('TrayPopout is not loaded') }
  }

  /* ****************************************************************************/
  // UI Events
  /* ****************************************************************************/

  /**
  * Handles the blur event
  */
  _handleBlur = () => {
    if (this.isWindowedMode) { return }

    if (process.platform === 'win32') {
      clearTimeout(this[privHideTO])
      this[privHideTO] = setTimeout(() => {
        this.hide()
      }, 250)
    } else {
      this.hide()
    }
  }

  /**
  * Handles the focus event
  */
  _handleFocus = () => {
    clearTimeout(this[privHideTO])
  }

  /**
  * Handles the close event
  */
  _handleClose = (evt) => {
    if (this.isWindowedMode) {
      evt.preventDefault()
      this[privWindow].hide()
    }
  }

  /* ****************************************************************************/
  // Show
  /* ****************************************************************************/

  /**
  * Positions the window for the given bounds
  * @param bound: the bounds to position for
  */
  _positionWindow (bounds) {
    if (!bounds) { return }

    const position = settingsStore.getState().tray.popoutPosition
    if (position === POPOUT_POSITIONS.AUTO) {
      if (process.platform === 'darwin') {
        this[privPositioner].move('trayCenter', bounds)
      } else if (process.platform === 'win32') {
        const screenSize = screen.getDisplayMatching(bounds).workAreaSize

        if (bounds.x < 50) {
          // Taskbar Left
          const { x, y } = this[privPositioner].calculate('trayBottomLeft', bounds)
          this[privWindow].setPosition(x + 60, y)
        } else if (screenSize.width - bounds.x < 50) {
          // Taskbar Right
          this[privPositioner].move('trayBottomRight', bounds)
        } else if (bounds.y < 50) {
          // Taskbar Top
          this[privPositioner].move('trayCenter', bounds)
        } else {
          // Taskbar Bottom
          this[privPositioner].move('trayBottomCenter', bounds)
        }
      } else if (process.platform === 'linux') {
        // Linux doesn't support giving bounds, it just gives a dummy object.
        // Use a default of bottom right
        this[privPositioner].move('bottomRight')
      }
    } else {
      if (process.platform !== 'linux') {
        switch (position) {
          case POPOUT_POSITIONS.TOP_CENTER: this[privPositioner].move('trayCenter', bounds); break
          case POPOUT_POSITIONS.TOP_LEFT: this[privPositioner].move('trayLeft', bounds); break
          case POPOUT_POSITIONS.TOP_RIGHT: this[privPositioner].move('trayRight', bounds); break
          case POPOUT_POSITIONS.BOTTOM_CENTER: this[privPositioner].move('trayBottomCenter', bounds); break
          case POPOUT_POSITIONS.BOTTOM_LEFT: this[privPositioner].move('trayBottomLeft', bounds); break
          case POPOUT_POSITIONS.BOTTOM_RIGHT: this[privPositioner].move('trayBottomRight', bounds); break
        }
      } else {
        // Because we wont get tray boudns on linux lock to the edges of the
        // screen instead
        switch (position) {
          case POPOUT_POSITIONS.TOP_CENTER: this[privPositioner].move('topCenter', bounds); break
          case POPOUT_POSITIONS.TOP_LEFT: this[privPositioner].move('topLeft', bounds); break
          case POPOUT_POSITIONS.TOP_RIGHT: this[privPositioner].move('topRight', bounds); break
          case POPOUT_POSITIONS.BOTTOM_CENTER: this[privPositioner].move('bottomCenter', bounds); break
          case POPOUT_POSITIONS.BOTTOM_LEFT: this[privPositioner].move('bottomLeft', bounds); break
          case POPOUT_POSITIONS.BOTTOM_RIGHT: this[privPositioner].move('bottomRight', bounds); break
        }
      }
    }
  }

  /**
  * Shows the window in its current mode
  * @param bounds: the current tray bounds
  */
  show (bounds) {
    if (this.isWindowedMode) {
      this.showInWindowMode()
    } else {
      this.showInDockedMode(bounds)
    }
  }

  /**
  * Shows the tray in tray mode
  * @param bounds: the current tray bounds
  */
  showInDockedMode (bounds) {
    this._throwIfNotLoaded()

    this.changeToTrayMode()
    this._positionWindow(bounds)
    this[privWindow].show()
    this[privWindow].focus()
  }

  /**
  * Shows the tray in windowed mode
  */
  showInWindowMode () {
    this._throwIfNotLoaded()

    this.changeToWindowMode()
    this[privWindow].show()
    this[privWindow].focus()
  }

  /* ****************************************************************************/
  // Hide
  /* ****************************************************************************/

  /**
  * Hides the tray
  */
  hide () {
    this._throwIfNotLoaded()

    if (this.isWindowedMode) {
      this[privWindow].minimize()
    } else {
      this[privWindow].hide()
    }
  }

  /* ****************************************************************************/
  // Toggle
  /* ****************************************************************************/

  /**
  * Toggles the tray
  * @param bounds=undefined: the current tray bounds if available
  */
  toggleVisibility (bounds = undefined) {
    this._throwIfNotLoaded()

    if (this.isVisible) {
      this.hide()
    } else {
      this.show(bounds)
    }
  }

  /**
  * Toggles between window modes
  */
  toggleWindowMode () {
    this._throwIfNotLoaded()

    if (this.isWindowedMode) {
      this.changeToTrayMode()
      this[privWindow].hide()
    } else {
      this.changeToWindowMode()
      this[privWindow].show()
      this[privWindow].focus()
    }
  }

  /* ****************************************************************************/
  // Mode
  /* ****************************************************************************/

  /**
  * Changes the window to window mode
  */
  changeToWindowMode () {
    this._throwIfNotLoaded()
    if (this[privIsWindowMode] === true) { return }

    // Update the window config
    this[privWindow].setAlwaysOnTop(false)
    this[privWindow].setSkipTaskbar(false)
    this[privWindow].setMovable(true)
    this[privWindow].setResizable(true)
    this[privIsWindowMode] = true

    // Move window for user & update guest
    this[privWindow].webContents.send(WB_TRAY_WINDOWED_MODE_CHANGED, true)
    this[privWindow].center()

    // Add into cycling
    WaveboxWindow.attachSpecial(this[privWindow].id)
  }

  /**
  * Changes the window to tray mode
  */
  changeToTrayMode () {
    this._throwIfNotLoaded()
    if (this[privIsWindowMode] === false) { return }

    // Update the window config
    this[privWindow].setAlwaysOnTop(true)
    this[privWindow].setSkipTaskbar(true)
    this[privWindow].setMovable(false)
    this[privWindow].setResizable(false)
    this[privIsWindowMode] = false

    // Hide the window for the user (we have no position for them!) user & update guest
    this[privWindow].webContents.send(WB_TRAY_WINDOWED_MODE_CHANGED, false)

    // Remove from cycling
    WaveboxWindow.detachSpecial(this[privWindow].id)
  }
}

export default new TrayPopout()
