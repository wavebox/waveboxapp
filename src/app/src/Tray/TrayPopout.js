import { BrowserWindow } from 'electron'
import Resolver from 'Runtime/Resolver'
import Positioner from 'electron-positioner'

const privWindow = Symbol('privWindow')
const privPositioner = Symbol('privPositioner')

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
      show: false,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      movable: false,
      resizable: false,
      backgroundColor: '#ffffff',
      transparent: false,
      webPreferences: {
        nodeIntegration: true
      }
    })
    this[privPositioner] = new Positioner(this[privWindow])
    this[privWindow].loadURL(`file://${Resolver.traypopoutScene('popout.html')}`)
    this[privWindow].on('blur', () => this[privWindow].hide())
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isLoaded () { return !!this[privWindow] }
  get webContentsId () { return this.isLoaded ? this[privWindow].webContents.id : undefined }
  get isVisible () { return this[privWindow].isVisible() && this[privWindow].isFocused() }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  _throwIfNotLoaded () {
    if (!this.isLoaded) { throw new Error('TrayPopout is not loaded') }
  }

  /* ****************************************************************************/
  // Show / Hide
  /* ****************************************************************************/

  /**
  * Shows the tray
  * @param bounds: the current tray bounds
  */
  show (bounds) {
    this._throwIfNotLoaded()
    this[privPositioner].move('trayCenter', bounds)
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
