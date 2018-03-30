const Model = require('../Model')

const GTK_UPDATE_MODES = Object.freeze({
  UPDATE: 'UPDATE',
  RECREATE: 'RECREATE',
  STATIC: 'STATIC'
})

const POPOUT_POSITIONS = Object.freeze({
  AUTO: 'AUTO',
  TOP_CENTER: 'TOP_CENTER',
  TOP_LEFT: 'TOP_LEFT',
  TOP_RIGHT: 'TOP_RIGHT',
  BOTTOM_CENTER: 'BOTTOM_CENTER',
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT'
})

const CLICK_ACTIONS = Object.freeze({
  TOGGLE_POPOUT: 'TOGGLE_POPOUT',
  SHOW_POPOUT: 'SHOW_POPOUT',
  HIDE_POPOUT: 'HIDE_POPOUT',
  TOGGLE_APP: 'TOGGLE_APP',
  SHOW_APP: 'SHOW_APP',
  HIDE_APP: 'HIDE_APP',
  NONE: 'NONE'
})

class TraySettings extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get CLICK_ACTIONS () { return CLICK_ACTIONS }
  static get SUPPORTS_ADDITIONAL_CLICK_EVENTS () { return process.platform === 'win32' || process.platform === 'darwin' }
  static get GTK_UPDATE_MODES () { return GTK_UPDATE_MODES }
  static get POPOUT_POSITIONS () { return POPOUT_POSITIONS }
  static get SUPPORTS_DOCK_HIDING () { return process.platform === 'darwin' }
  static get SUPPORTS_TASKBAR_HIDING () { return process.platform === 'win32' }
  static get IS_GTK_PLATFORM () { return process.platform === 'linux' }
  static get IS_SOMETIMES_CTX_MENU_ONLY_PLATFORM () { return process.platform === 'linux' }

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
  get removeFromTaskbarWin32 () { return this._value_('removeFromTaskbarWin32', false) }
  get clickAction () {
    if (process.platform === 'win32') {
      return this._value_('clickAction', CLICK_ACTIONS.SHOW_APP)
    } else {
      return this._value_('clickAction', CLICK_ACTIONS.TOGGLE_POPOUT)
    }
  }
  get altClickAction () { return this._value_('altClickAction', CLICK_ACTIONS.HIDE_POPOUT) }
  get rightClickAction () {
    if (process.platform === 'darwin') {
      return this._value_('rightClickAction', CLICK_ACTIONS.TOGGLE_APP)
    } else if (process.platform === 'win32') {
      return this._value_('rightClickAction', CLICK_ACTIONS.TOGGLE_POPOUT)
    } else {
      return this._value_('rightClickAction', CLICK_ACTIONS.NONE)
    }
  }
  get doubleClickAction () {
    if (process.platform === 'win32') {
      return this._value_('doubleClickAction', CLICK_ACTIONS.TOGGLE_APP)
    } else {
      return this._value_('doubleClickAction', CLICK_ACTIONS.NONE)
    }
  }

  /* **************************************************************************/
  // Properties: Popout
  /* **************************************************************************/

  get popoutPosition () { return this._value_('popoutPosition', POPOUT_POSITIONS.AUTO) }

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
