const { ipcRenderer } = require('electron')
const req = require('../req')
const { WCRPC_DOM_READY } = req.shared('webContentsRPC')

class KeyboardNavigator {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this._setup = false
    this._boundBindListener = this._bindListener.bind(this)
    document.addEventListener('DOMContentLoaded', this._boundBindListener, false)
    ipcRenderer.once(WCRPC_DOM_READY, this._boundBindListener)
  }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  _bindListener () {
    if (this._setup) { return }
    this._setup = true
    document.body.addEventListener('keydown', this._handleKeydown, false)
    document.removeEventListener('DOMContentLoaded', this._boundBindListener)
    ipcRenderer.removeListener(WCRPC_DOM_READY, this._boundBindListener)
  }

  _handleKeydown (evt) {
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

module.exports = KeyboardNavigator
