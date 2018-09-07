import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'

const conversion = {
  CMD: '⌘ Cmd',
  COMMAND: '⌘ Cmd',
  CTRL: '⌃ Ctrl',
  CONTROL: '⌃ Ctrl',
  ALT: '⌥ Alt',
  ALTGR: '⌥ Alt',
  OPTION: '⌥ Option',
  SHIFT: '⇧ Shift',
  SUPER: {
    win32: '⊞ Win',
    linux: '❖ Special',
    darwin: '⌘ Cmd'
  },
  COMMANDORCONTROL: {
    win32: '⌃ Ctrl',
    linux: '⌃ Ctrl',
    darwin: '⌘ Cmd'
  },
  CMDORCTRL: {
    win32: '⌃ Ctrl',
    linux: '⌃ Ctrl',
    darwin: '⌘ Cmd'
  },
  PLUS: 'Plus',
  SPACE: 'Space',
  TAB: '↹ Tab',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  RETURN: '⏎',
  ENTER: '⏎',
  ESCAPE: 'Esc',
  ESC: 'Esc'
}

class ElectronAccelerator extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    accelerator: PropTypes.string,
    keyClassName: PropTypes.string,
    plusClassName: PropTypes.string,
    showPlus: PropTypes.bool.isRequired
  }

  static defaultProps = {
    showPlus: true
  }

  /**
  * Tests if the accelerator is valid and will render
  * @param accelerator: the accelerator to test
  * @return true if valid, false otherwise
  */
  static isValid (accelerator) {
    if (typeof (accelerator) !== 'string') { return false }
    if (!accelerator) { return false }
    if (accelerator.indexOf('+') === -1) { return false }

    return true
  }

  /**
  * Converts an accelerator to symbols
  * @param accelerator: the accelerator to convert
  * @param platform=process.platform: the platform to convert for
  * @return an array of symbols
  */
  static convertToSymbols (accelerator, platform = process.platform) {
    return accelerator.split('+').map((item) => {
      item = item.toUpperCase()
      const special = conversion[item]
      if (special) {
        if (typeof (special) === 'string') {
          return special
        } else if (typeof (special) === 'object') {
          if (special[platform]) {
            return special[platform]
          } else {
            return item
          }
        }
      }
      return item
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      accelerator,
      showPlus,
      keyClassName,
      plusClassName,
      ...passProps
    } = this.props

    let acceleratorKeys
    try {
      acceleratorKeys = ElectronAccelerator.convertToSymbols(accelerator)
    } catch (ex) {
      acceleratorKeys = undefined
    }

    if (acceleratorKeys && acceleratorKeys.length) {
      if (showPlus) {
        acceleratorKeys = acceleratorKeys.reduce((acc, k) => {
          return acc.concat(k, 0)
        }, []).slice(0, -1)
      }

      return (
        <span {...passProps}>
          {acceleratorKeys.map((k, i) => {
            if (k === 0) {
              return (<span key={`+_` + i} className={plusClassName}>+</span>)
            } else {
              return (<kbd key={k} className={keyClassName}>{k}</kbd>)
            }
          })}
        </span>
      )
    } else {
      return false
    }
  }
}

export default ElectronAccelerator
