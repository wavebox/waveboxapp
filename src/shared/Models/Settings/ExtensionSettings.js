const Model = require('../Model')

const TOOLBAR_BROWSER_ACTION_LAYOUT = Object.freeze({
  ALIGN_LEFT: 'ALIGN_LEFT',
  ALIGN_RIGHT: 'ALIGN_RIGHT'
})

class ExtensionSettings extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get TOOLBAR_BROWSER_ACTION_LAYOUT () { return TOOLBAR_BROWSER_ACTION_LAYOUT }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get showBrowserActionsInToolbar () { return this._value_('showBrowserActionsInToolbar', true) }
  get toolbarBrowserActionLayout () { return this._value_('toolbarBrowserActionLayout', TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_RIGHT) }
}

module.exports = ExtensionSettings
