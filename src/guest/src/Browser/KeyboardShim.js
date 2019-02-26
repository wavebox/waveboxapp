import WBRPCRenderer from 'shared/WBRPCRenderer'

const privNavBackBound = Symbol('privNavBackBound')

class KeyboardShim {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privNavBackBound] = false
    document.addEventListener('DOMContentLoaded', this._bindNavBack, false)
    WBRPCRenderer.webContents.once('dom-ready', this._bindNavBack)
  }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  /**
  * Binds the navigate back keyboard command into the dom
  */
  _bindNavBack = () => {
    if (this[privNavBackBound]) { return }
    this[privNavBackBound] = true

    document.body.addEventListener('keydown', this._handleKeydownNavBack, false)

    document.removeEventListener('DOMContentLoaded', this._bindNavBack)
    WBRPCRenderer.webContents.removeListener('dom-ready', this._bindNavBack)
  }

  /**
  * Handles the navigate back call
  * @param evt: the dom event that fired
  */
  _handleKeydownNavBack (evt) {
    if (evt.keyCode === 8) { // Backspace
      // Look for reasons to cancel
      if (evt.target.tagName === 'INPUT') { return }
      if (evt.target.tagName === 'TEXTAREA') { return }
      if (evt.target.tagName === 'SELECT') { return }
      if (evt.target.tagName === 'OPTION') { return }
      if (evt.path.find((e) => e.isContentEditable)) { return }

      window.history.back()
    }
  }
}

export default KeyboardShim
