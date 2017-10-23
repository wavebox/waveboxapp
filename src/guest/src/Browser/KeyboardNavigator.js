const { remote } = require('electron')

class KeyboardNavigator {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this._setup = false
    document.addEventListener('DOMContentLoaded', this._bindListener.bind(this), false)
    remote.getCurrentWebContents().once('dom-ready', this._bindListener.bind(this))
  }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  _bindListener () {
    if (this._setup) { return }
    this._setup = true
    document.body.addEventListener('keydown', this._handleKeydown, false)
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
