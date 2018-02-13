const Model = require('../Model')

const MOUSE_TRIGGERS = Object.assign({
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE'
})

const MOUSE_TRIGGER_ACTIONS = Object.assign({
  TOGGLE: 'TOGGLE',
  TOGGLE_MINIMIZE: 'TOGGLE_MINIMIZE',
  SHOW: 'SHOW'
})

const GTK_UPDATE_MODES = Object.assign({
  UPDATE: 'UPDATE',
  RECREATE: 'RECREATE',
  STATIC: 'STATIC'
})

class TraySettings extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get MOUSE_TRIGGERS () { return MOUSE_TRIGGERS }
  static get MOUSE_TRIGGER_ACTIONS () { return MOUSE_TRIGGER_ACTIONS }
  static get GTK_UPDATE_MODES () { return GTK_UPDATE_MODES }
  static get SUPPORTS_MOUSE_TRIGGERS () { return process.platform === 'win32' }
  static get SUPPORTS_TRAY_MINIMIZE_CONFIG () { return process.platform === 'win32' }
  static get SUPPORTS_DOCK_HIDING () { return process.platform === 'darwin' }
  static get IS_GTK_PLATFORM () { return process.platform === 'linux' }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param data: the tray data
  * @param themedDefaults: the default values for the tray
  */
  constructor (data, themedDefaults = {}) {
    super(data)
    this.__themedDefaults__ = Object.freeze(Object.assign({}, themedDefaults))
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get show () { return this._value_('show', true) }
  get showUnreadCount () { return this._value_('showUnreadCount', true) }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get removeFromDockDarwin () { return this._value_('removeFromDockDarwin', false) }
  get mouseTrigger () { return this._value_('mouseTrigger', MOUSE_TRIGGERS.SINGLE) }
  get mouseTriggerAction () { return this._value_('mouseTriggerAction', MOUSE_TRIGGER_ACTIONS.TOGGLE) }
  get hideWhenMinimized () { return this._value_('hideWhenMinimized', false) }
  get hideWhenClosed () { return this._value_('hideWhenClosed', true) }
  get classicTray () { return this._value_('classicTray', false) }

  /* **************************************************************************/
  // Properties: Theming
  /* **************************************************************************/

  get readColor () { return this._value_('readColor', this.__themedDefaults__.readColor) }
  get readBackgroundColor () { return this._value_('readBackgroundColor', this.__themedDefaults__.readBackgroundColor) }
  get unreadColor () { return this._value_('unreadColor', this.__themedDefaults__.unreadColor) }
  get unreadBackgroundColor () { return this._value_('unreadBackgroundColor', this.__themedDefaults__.unreadBackgroundColor) }

  /* **************************************************************************/
  // Properties: Display Config
  /* **************************************************************************/

  get gtkUpdateMode () { return this._value_('gtkUpdateMode', GTK_UPDATE_MODES.UPDATE) }
  get dpiMultiplier () {
    let defaultValue = 1
    try {
      if (typeof (window.devicePixelRatio) === 'number') {
        defaultValue = window.devicePixelRatio
      }
    } catch (ex) { }
    return this._value_('dpiMultiplier', defaultValue)
  }

  get iconSize () {
    const iconSize = this._value_('iconSize', undefined)
    if (iconSize) {
      return iconSize
    } else {
      switch (process.platform) {
        case 'darwin': return 22
        case 'win32': return 16
        case 'linux': return 32
        default: return 32
      }
    }
  }
}

module.exports = TraySettings
