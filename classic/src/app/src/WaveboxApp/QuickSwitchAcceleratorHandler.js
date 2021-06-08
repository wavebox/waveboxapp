import { EventEmitter } from 'events'
import WaveboxAppCommandKeyTracker from './WaveboxAppCommandKeyTracker'

const privNextAccelerator = Symbol('privNextAccelerator')
const privPrevAccelerator = Symbol('privPrevAccelerator')
const privNextCommandKeys = Symbol('privNextCommandKeys')
const privPrevCommandKeys = Symbol('privPrevCommandKeys')
const privInLongPress = Symbol('privInLongPress')
const privPresentOptionsTO = Symbol('privPresentOptionsTO')
const privSentPresentOptions = Symbol('privSentPresentOptions')
const privDirection = Symbol('privDirection')

const DIRECTIONS = {
  NONE: 'NONE',
  NEXT: 'NEXT',
  PREV: 'PREV'
}
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

class QuickSwitchAcceleratorHandler extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param nextAccelerator: the next accelerator string
  * @param prevAccelerator: the previous accelerator string
  */
  constructor (nextAccelerator, prevAccelerator) {
    super()

    this[privInLongPress] = false
    this[privPresentOptionsTO] = 0
    this[privDirection] = DIRECTIONS.NONE

    this[privNextAccelerator] = nextAccelerator
    this[privNextCommandKeys] = this._parseCommandKeys(this[privNextAccelerator])
    this[privPrevAccelerator] = prevAccelerator
    this[privPrevCommandKeys] = this._parseCommandKeys(this[privPrevAccelerator])
  }

  /* ****************************************************************************/
  // Data Lifecycle
  /* ****************************************************************************/

  /**
  * Changes the accelerator
  * @param nextAccelerator: the new next accelerator string
  * @param prevAccelerator: the new prev accelerator string
  */
  changeAccelerator (nextAccelerator, prevAccelerator) {
    if (this[privNextAccelerator] !== nextAccelerator) {
      this[privNextAccelerator] = nextAccelerator
      this[privNextCommandKeys] = this._parseCommandKeys(this[privNextAccelerator])

      this[privInLongPress] = false
    }

    if (this[privPrevAccelerator] !== prevAccelerator) {
      this[privPrevAccelerator] = prevAccelerator
      this[privPrevCommandKeys] = this._parseCommandKeys(this[privPrevAccelerator])

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
        this._emitFastSwitchEvent()
      }
    }
  }

  /* ****************************************************************************/
  // Key Utils
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
  * Checks if a command key is pressed
  * @param key: the key to press
  * @return true if it's pressed, false otherwise
  */
  _commandKeyIsPressed (key) {
    switch (key) {
      case COMMAND_KEYS.META: return WaveboxAppCommandKeyTracker.metaPressed
      case COMMAND_KEYS.CONTROL: return WaveboxAppCommandKeyTracker.controlPressed
      case COMMAND_KEYS.ALT: return WaveboxAppCommandKeyTracker.altPressed
      case COMMAND_KEYS.SHIFT: return WaveboxAppCommandKeyTracker.shiftPressed
      default: return false
    }
  }

  /**
  * Checks if the command keys are pressed
  * @return true if the command keys are pressed
  */
  _commandKeysArePressed () {
    // Look for the intersection of keys between the two accelerators
    const commonCommandKeys = Array.from(
      [].concat(
        this[privNextCommandKeys],
        this[privPrevCommandKeys]
      ).reduce((acc, k) => {
        acc.set(k, (acc.get(k) || 0) + 1)
        return acc
      }, new Map()).entries()
    ).filter((ent) => ent[1] > 1).map((ent) => ent[0])

    if (commonCommandKeys.length) {
      // If there are common keys, we expect the common ones to always be pressed
      // For example Ctrl+Tab & Ctrl+Shift+Tab we expect Ctrl to always be pressed
      const notPressed = commonCommandKeys.find((k) => !this._commandKeyIsPressed(k))
      return notPressed === undefined
    } else {
      // If there are no common keys, we expect one of the control keys to always
      // be pressed. For example Ctrl+Tab & Alt+Tab we expect either Ctrl or Alt to
      // always be pressed
      const nextNotPressed = this[privNextCommandKeys].find((k) => !this._commandKeyIsPressed(k))
      if (nextNotPressed === undefined) { return true }

      const prevNotPressed = this[privPrevCommandKeys].find((k) => !this._commandKeyIsPressed(k))
      if (prevNotPressed === undefined) { return true }

      return false
    }
  }

  /**
  * Calculates a rough complexity metric for the user needing to release the command keys
  * @return a timeout that can be waited for before bringing up up
  */
  _commandKeyReleaseComplexityTime () {
    if (this[privDirection] === DIRECTIONS.NEXT) {
      return 200 + ((this[privNextCommandKeys].length - 1) * 50)
    } else if (this[privDirection] === DIRECTIONS.PREV) {
      return 200 + ((this[privPrevCommandKeys].length - 1) * 50)
    } else {
      return 200
    }
  }

  /* ****************************************************************************/
  // Event Utils
  /* ****************************************************************************/

  /**
  * Emits the present options event if it's not been emitted already
  * @return true if it was emitted, false if not
  */
  _emitPresentOptionsEvent () {
    if (this[privSentPresentOptions]) { return false }

    this[privSentPresentOptions] = true
    if (this[privDirection] === DIRECTIONS.NEXT) {
      this.emit('present-options-next', {})
    } else if (this[privDirection] === DIRECTIONS.PREV) {
      this.emit('present-options-prev', {})
    }
    return true
  }

  /**
  * Emits the change option event depending on the current direction
  */
  _emitChangeOptionEvent () {
    if (this[privDirection] === DIRECTIONS.NEXT) {
      this.emit('next-option', {})
    } else if (this[privDirection] === DIRECTIONS.PREV) {
      this.emit('prev-option', {})
    }
  }

  /**
  * Emits the fast switch event
  */
  _emitFastSwitchEvent () {
    if (this[privDirection] === DIRECTIONS.NEXT) {
      this.emit('fast-switch-next', {})
    } else if (this[privDirection] === DIRECTIONS.PREV) {
      this.emit('fast-switch-prev', {})
    }
  }

  /* ****************************************************************************/
  // Firing
  /* ****************************************************************************/

  /**
  * Indicates the next accelerator fired
  */
  nextAcceleratorFired = () => {
    this[privDirection] = DIRECTIONS.NEXT
    this._acceleratorFired()
  }

  /**
  * Indicates the prev accelerator fired
  */
  prevAcceleratorFired = () => {
    this[privDirection] = DIRECTIONS.PREV
    this._acceleratorFired()
  }

  /**
  * Indicates the accelerator fired
  * @param next: true if the direction is next
  */
  _acceleratorFired () {
    clearTimeout(this[privPresentOptionsTO])

    if (this[privInLongPress] && this._commandKeysArePressed()) {
      this._emitPresentOptionsEvent()
      this._emitChangeOptionEvent()
    } else {
      if (this._commandKeysArePressed()) {
        this[privInLongPress] = true
        this[privSentPresentOptions] = false
        WaveboxAppCommandKeyTracker.on('changed', this._handleCommandKeysChanged)

        this[privPresentOptionsTO] = setTimeout(() => {
          this._emitPresentOptionsEvent()
        }, this._commandKeyReleaseComplexityTime())
      } else {
        this._emitFastSwitchEvent()
      }
    }
  }
}

export default QuickSwitchAcceleratorHandler
