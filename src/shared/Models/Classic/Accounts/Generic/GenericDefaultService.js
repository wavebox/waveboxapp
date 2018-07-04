const CoreService = require('../CoreService')

class GenericDefaultService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.DEFAULT }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat([
      'lastUnseenNotificationTime'
    ])
  }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Weblink' }
  static get humanizedLogos () {
    return [
      'generic/logo_32px.png',
      'generic/logo_48px.png',
      'generic/logo_64px.png',
      'generic/logo_96px.png',
      'generic/logo_128px.png'
    ]
  }
  static get humanizedUnreadItemType () { return 'notification' }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get sleepable () { return this._value_('sleepable', false) }
  get depricatedOpenWindowsExternally () { return this._value_('openWindowsExternally', false) }
  get hasNavigationToolbar () { return this._value_('hasNavigationToolbar', false) }
  // I think we're legacy and shouldn't be included anymore
  /* get defaultWindowOpenMode () {
    const depricatedValue = this._value_('openWindowsExternally', undefined)
    const currentValue = this._value_('defaultWindowOpenMode', undefined)

    if (currentValue !== undefined) { return currentValue }
    if (depricatedValue !== undefined) { return this.constructor.DEFAULT_WINDOW_OPEN_MODES[depricatedValue ? 'BROWSER' : 'WAVEBOX'] }

    return super.defaultWindowOpenMode
  } */

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return true }
  get supportsGuestNotifications () { return true }
  get supportsUnreadCount () { return this.supportsGuestConfig }
  get supportsTrayMessages () { return this.supportsGuestConfig }
  get supportsGuestConfig () { return this._value_('supportsGuestConfig', false) }

  /* **************************************************************************/
  // Properties: Behavuour
  /* **************************************************************************/

  get mergeChangesetOnActive () { return { lastUnseenNotificationTime: null } }
  get reloadBehaviour () { return this.constructor.RELOAD_BEHAVIOURS.RELOAD }

  /* **************************************************************************/
  // Properties: Url
  /* **************************************************************************/

  get url () { return this.__data__.url || 'about:blank' }
  get restoreLastUrlDefault () { return true }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get hasUnreadActivity () {
    if (this.supportsGuestConfig) {
      return this.guestConfig.hasUnreadActivity
    } else {
      return !!this._value_('lastUnseenNotificationTime', undefined)
    }
  }
}

module.exports = GenericDefaultService
