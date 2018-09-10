import Model from '../Model'

/**
* This model actually consumes the classic container data. In the future we'll
* migrate the data the server delivers so this can be refactored to support
* both or one of
*/
class ACClassicContainer extends Model {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this._value_('id') }
  get version () { return this.__data__.version || 0 }
  get minAppVersion () { return this.__data__.minAppVersion }
  get isClassic () { return true }

  /* **************************************************************************/
  // Properties: Install
  /* **************************************************************************/

  get postInstallUrl () { return this._value_('postInstallUrl', '') }
  get postInstallUrlDelay () { return this._value_('postInstallUrlDelay', 2500) }
  get hasPostInstallUrl () { return !!this.postInstallUrl }
  get installHasPersonaliseStep () { return this.hasUrlSubdomain }

  /* **************************************************************************/
  // Properties: Appearance
  /* **************************************************************************/

  get name () { return this._value_('name', 'Container') }
  get defaultColor () { return this._value_('defaultColor', 'rgb(255, 255, 255)') }
  get logos () { return this._value_('logos', []) }
  get logo () { return this.logos.slice(-1)[0] }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return this._classicServiceValue_('supportsUnreadActivity', true) }
  get supportsGuestNotifications () { return this._classicServiceValue_('supportsGuestNotifications', true) }
  get supportsUnreadCount () { return this._classicServiceValue_('supportsUnreadCount', true) }
  get supportsTrayMessages () { return this._classicServiceValue_('supportsTrayMessages', false) }
  get supportsWBGAPI () { return this._classicServiceValue_('supportsGuestConfig', false) }

  /* **************************************************************************/
  // Properties: Subdomain
  /* **************************************************************************/

  get url () { return this._classicServiceValue_('url', 'about:blank') }
  get urlSubdomainName () { return this._value_('urlSubdomainName', 'subdomain') }
  get urlSubdomainHint () { return this._value_('urlSubdomainHint', '') }
  get hasUrlSubdomain () { return this._value_('hasUrlSubdomain', false) }
  get restoreLastUrlDefault () { return this._classicServiceValue_('restoreLastUrlDefault', false) }

  /**
  * @param subdomain: the subdomain to replace with
  * @return the url with the subdomain replaced
  */
  getUrlWithSubdomain (subdomain) {
    if (this.hasUrlSubdomain) {
      return (this.url || '').replace(/{{subdomain}}/g, subdomain)
    } else {
      return this.url
    }
  }

  /* **************************************************************************/
  // Properties: Adaptor
  /* **************************************************************************/

  get adaptors () { return this._classicServiceValue_('adaptors', []) }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get reloadBehaviour () { return this._classicServiceValue_('reloadBehaviour', 'RESET_URL') }
  get useAsyncAlerts () { return this._classicServiceValue_('useAsyncAlerts', true) }
  get html5NotificationsGenerateUnreadActivity () { return this._classicServiceValue_('html5NotificationsGenerateUnreadActivity', true) }

  /* **************************************************************************/
  // Properties: Unread
  /* **************************************************************************/

  get documentTitleHasUnread () { return this._classicServiceValue_('documentTitleHasUnread', true) }
  get documentTitleUnreadBlinks () { return this._classicServiceValue_('documentTitleUnreadBlinks', false) }
  get faviconUnreadActivityRegexp () { return this._classicServiceValue_('faviconUnreadActivityRegexp', undefined) }

  /* **************************************************************************/
  // Properties: User settings
  /* **************************************************************************/

  get hasNavigationToolbarDefault () { return this._classicServiceValue_('hasNavigationToolbarDefault', true) }
  get sleepableDefault () { return this._classicServiceValue_('sleepableDefault', true) }
  get showNotificationsDefault () { return this._classicServiceValue_('showNotificationsDefault', true) }
  get showBadgeCountDefault () { return this._classicServiceValue_('showUnreadBadgeDefault', true) }
  get showBadgeCountInAppDefault () { return this._classicServiceValue_('unreadCountsTowardsAppUnreadDefault', true) }
  get showBadgeActivityInAppDefault () { return this._classicServiceValue_('showUnreadActivityBadgeDefault', true) }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Gets a value from the classic service setup
  * @param key: the key to get
  * @param defaultValue: the default value
  * @return the value or the default
  */
  _classicServiceValue_ (key, defaultValue) {
    const service = (this.__data__.services || {}).DEFAULT
    if (service) {
      return service[key] === undefined ? defaultValue : service[key]
    } else {
      return defaultValue
    }
  }

  /* **************************************************************************/
  // Cloning
  /* **************************************************************************/

  /**
  * Makes a clone of the data that can be injected into a mailbox
  */
  cloneForService () { return this.cloneData() }
}

export default ACClassicContainer
