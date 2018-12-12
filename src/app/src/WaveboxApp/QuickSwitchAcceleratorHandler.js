import { EventEmitter } from 'events'
import WaveboxAppCommandKeyTracker from './WaveboxAppCommandKeyTracker'

const privAccelerator = Symbol('privAccelerator')
const privCommandKeys = Symbol('privCommandKeys')
const privInLongPress = Symbol('privInLongPress')
const privPresentOptionsTO = Symbol('privPresentOptionsTO')
const privSentPresentOptions = Symbol('privSentPresentOptions')

const COMMAND_KEYS = {
  META: 'META',
  CONTROL: 'CONTROL',
  ALT: 'ALT',
  SHIFT: 'SHIFT'
}
const ACCELERATOR_TO_COMMAND_KEY = {
  CMD: COMMAND_KEYS.META,
  COMMAND: COMMAND_KEYS.META,
  CTRL: COMMAND_KEYS.CONTROL,
  CONTROL: COMMAND_KEYS.CONTROL,
  ALT: COMMAND_KEYS.ALT,
  ALTGR: COMMAND_KEYS.ALT,
  OPTION: COMMAND_KEYS.ALT,
  SHIFT: COMMAND_KEYS.SHIFT,
  SUPER: COMMAND_KEYS.META,
  COMMANDORCONTROL: process.platform === 'darwin' ? COMMAND_KEYS.META : COMMAND_KEYS.CONTROL,
  CMDORCTRL: process.platform === 'darwin' ? COMMAND_KEYS.META : COMMAND_KEYS.CONTROL
}

//TODO test with double combination Ctrl+Shift+Tab
class QuickSwitchAcceleratorHandler extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param accelerator: the accelerator string
  */
  constructor (accelerator) {
    super()

    this[privInLongPress] = false
    this[privPresentOptionsTO] = 0
    this[privAccelerator] = accelerator
    this[privCommandKeys] = this._parseCommandKeys(this[privAccelerator])
  }

  /* ****************************************************************************/
  // Data Lifecycle
  /* ****************************************************************************/

  /**
  * Changes the accelerator
  * @param accelerator: the new accelerator string
  */
  changeAccelerator (accelerator) {
    if (this[privAccelerator] !== accelerator) {
      this[privAccelerator] = accelerator
      this[privCommandKeys] = this._parseCommandKeys(this[privAccelerator])

      this[privInLongPress] = false
    }
  }

  /* ****************************************************************************/
  // Key Lifecycle
  /* ****************************************************************************/

  /**
  * Handles the command keys changing by checking if we exit the repeat cycle
  */
  _handleCommandKeysChanged = (evt, prev, next) => {
    if (!this._commandKeysArePressed()) {
      WaveboxAppCommandKeyTracker.removeListener('changed', this._handleCommandKeysChanged)
      this[privInLongPress] = false
      clearTimeout(this[privPresentOptionsTO])
      if (this[privSentPresentOptions]) {
        this.emit('select-option', {})
      } else {
        this.emit('fast-switch', {})
      }
    }
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * Parses the command keys from an accelerator
  * @param accel: the accelerator to parse
  * @return a list of command keys
  */
  _parseCommandKeys (accel) {
    if (typeof (accel) !== 'string') { return [] }
    const keys = new Set(accel
      .toUpperCase()
      .split('+')
      .map((k) => ACCELERATOR_TO_COMMAND_KEY[k])
      .filter((k) => !!k)
    )
    return Array.from(keys)
  }

  /**
  * Checks if the command keys are pressed
  * @return true if the command keys are pressed
  */
  _commandKeysArePressed () {
    if (this[privCommandKeys].length === 0) { return false }

    const notPressed = this[privCommandKeys].find((k) => {
      switch (k) {
        case COMMAND_KEYS.META: return !WaveboxAppCommandKeyTracker.metaPressed
        case COMMAND_KEYS.CONTROL: return !WaveboxAppCommandKeyTracker.controlPressed
        case COMMAND_KEYS.ALT: return !WaveboxAppCommandKeyTracker.altPressed
        case COMMAND_KEYS.SHIFT: return !WaveboxAppCommandKeyTracker.shiftPressed
        default: return true
      }
    })

    return notPressed === undefined
  }

  /* ****************************************************************************/
  // Firing
  /* ****************************************************************************/

  /**
  * Indicates the accelerator fired
  */
  acceleratorFired = () => {
    clearTimeout(this[privPresentOptionsTO])

    if (this[privInLongPress] && this._commandKeysArePressed()) {
      if (!this[privSentPresentOptions]) {
        this[privSentPresentOptions] = true
        this.emit('present-options', {})
      }
      this.emit('next-option', {})
    } else {
      this[privInLongPress] = true
      this[privSentPresentOptions] = false
      WaveboxAppCommandKeyTracker.on('changed', this._handleCommandKeysChanged)

      this[privPresentOptionsTO] = setTimeout(() => {
        this[privSentPresentOptions] = true
        this.emit('present-options', {})
      }, 200)
    }
  }
}

export default QuickSwitchAcceleratorHandler
