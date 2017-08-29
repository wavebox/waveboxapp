const Model = require('../Model')

const SIDEBAR_NEWS_MODES = Object.freeze({
  ALWAYS: 'ALWAYS',
  UNREAD: 'UNREAD',
  NEVER: 'NEVER'
})

class UISettings extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get SIDEBAR_NEWS_MODES () { return SIDEBAR_NEWS_MODES }

  /* **************************************************************************/
  // Titlebar
  /* **************************************************************************/

  get showTitlebar () { return this._value_('showTitlebar', process.platform !== 'darwin') }
  get showTitlebarCount () { return this._value_('showTitlebarCount', true) }
  get showTitlebarAccount () { return this._value_('showTitlebarAccount', true) }

  /* **************************************************************************/
  // App
  /* **************************************************************************/

  get showAppBadge () { return this._value_('showAppBadge', true) }
  get showAppMenu () { return this._value_('showAppMenu', process.platform !== 'win32') }
  get openHidden () { return this._value_('openHidden', false) }
  get showSleepableServiceIndicator () { return this._value_('showSleepableServiceIndicator', false) }

  /* **************************************************************************/
  // Sidebar
  /* **************************************************************************/

  get sidebarEnabled () { return this._value_('sidebarEnabled', true) }
  get showSidebarSupport () { return this._value_('showSidebarSupport', true) }
  get showSidebarNewsfeed () { return this._value_('showSidebarNewsfeed', SIDEBAR_NEWS_MODES.ALWAYS) }
}

module.exports = UISettings
