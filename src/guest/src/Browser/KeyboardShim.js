import { ipcRenderer } from 'electron'
import { WCRPC_DOM_READY } from 'shared/webContentsRPC'

const privNavBackBound = Symbol('privNavBackBound')

class KeyboardShim {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privNavBackBound] = false
    document.addEventListener('DOMContentLoaded', this._bindNavBack, false)
    ipcRenderer.once(WCRPC_DOM_READY, this._bindNavBack)
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
    ipcRenderer.removeListener(WCRPC_DOM_READY, this._bindNavBack)
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
