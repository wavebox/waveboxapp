import { BrowserWindow, screen } from 'electron'
import Resolver from 'Runtime/Resolver'
import Positioner from 'electron-positioner'
import { settingsStore } from 'stores/settings'
import { WB_MAIN_AFFINITY } from 'shared/webContentAffinities'
import {
  POPOUT_POSITIONS,
  CTX_MENU_ONLY_SUPPORT
} from 'shared/Models/Settings/TraySettings'

const privWindow = Symbol('privWindow')
const privPositioner = Symbol('privPositioner')
const privHideTO = Symbol('privHideTO')

class TrayPopout {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privWindow] = undefined
    this[privPositioner] = undefined
  }

  /**
  * Loads the tray
  */
  load () {
    if (this.isLoaded) { return }
    this[privWindow] = new BrowserWindow({
      width: 450,
      height: 500,
      minWidth: 300,
      minHeight: 300,
      show: false,
      backgroundColor: '#ffffff',
      transparent: false,
      webPreferences: {
        nodeIntegration: true,
        affinity: settingsStore.getState().launched.app.isolateWaveboxProcesses ? undefined : WB_MAIN_AFFINITY
      },
      ...(this.isWindowedMode ? {
        title: 'Wavebox Mini',
        maximizable: false
      } : {
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        movable: false,
        resizable: false
      })
    })
    this[privWindow].setMenuBarVisibility(false)
    this[privPositioner] = new Positioner(this[privWindow])
    this[privWindow].loadURL(`file://${Resolver.traypopoutScene('popout.html')}`)
    this[privWindow].on('blur', this._handleBlur)
    this[privWindow].on('focus', this._handleFocus)
    this[privWindow].on('close', this._handleClose)
  }

  /**
  * Destorys the window
  */
  unload () {
    if (!this.isLoaded) { return }
    this[privWindow].removeListener('close', this._handleClose)
    this[privWindow].close()
    this[privWindow] = undefined
    this[privPositioner] = undefined
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isLoaded () { return !!this[privWindow] }
  get webContentsId () { return this.isLoaded ? this[privWindow].webContents.id : undefined }
  get isVisible () { return this.isLoaded && this[privWindow].isVisible() }
  get isWindowedMode () { return CTX_MENU_ONLY_SUPPORT }

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
  // Show / Hide
  /* ****************************************************************************/

  /**
  * Positions the window for the given bounds
  * @param bound: the bounds to position for
  */
  _positionWindow (bounds) {
    const position = settingsStore.getState().tray.popoutPosition
    if (position === POPOUT_POSITIONS.AUTO) {
      if (process.platform === 'darwin') {
        this[privPositioner].move('trayCenter', bounds)
      } else if (process.platform === 'win32') {
        const screenSize = screen.getPrimaryDisplay().workAreaSize

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
        if (bounds.y < 100) {
          // Taskbar Top
          this[privPositioner].move('trayCenter', bounds)
        } else {
          // Taskbar Bottom
          this[privPositioner].move('trayBottomCenter', bounds)
        }
      }
    } else {
      switch (position) {
        case POPOUT_POSITIONS.TOP_CENTER:
          this[privPositioner].move('trayCenter', bounds)
          break
        case POPOUT_POSITIONS.TOP_LEFT:
          this[privPositioner].move('trayLeft', bounds)
          break
        case POPOUT_POSITIONS.TOP_RIGHT:
          this[privPositioner].move('trayRight', bounds)
          break
        case POPOUT_POSITIONS.BOTTOM_CENTER:
          this[privPositioner].move('trayBottomCenter', bounds)
          break
        case POPOUT_POSITIONS.BOTTOM_LEFT:
          this[privPositioner].move('trayBottomLeft', bounds)
          break
        case POPOUT_POSITIONS.BOTTOM_RIGHT:
          this[privPositioner].move('trayBottomRight', bounds)
          break
      }
    }
  }

  /**
  * Shows the tray
  * @param bounds: the current tray bounds
  */
  show (bounds) {
    this._throwIfNotLoaded()

    if (!this.isWindowedMode) {
      this._positionWindow(bounds)
    }

    this[privWindow].show()
    this[privWindow].focus()
  }

  /**
  * Hides the tray
  */
  hide () {
    this._throwIfNotLoaded()

    this[privWindow].hide()
  }

  /**
  * Toggles the tray
  * @param bounds: the current tray bounds
  */
  toggle (bounds) {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show(bounds)
    }
  }
}

export default new TrayPopout()
