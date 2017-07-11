const injector = require('../injector')

class KeyboardNavigator {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    injector.injectBodyEvent('keydown', this._handleKeydown_)
  }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  _handleKeydown_ (evt) {
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
