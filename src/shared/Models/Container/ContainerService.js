const Model = require('../Model')

class ContainerService extends Model {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param data: the data to use
  * @param metadata={}: metadata to use
  */
  constructor (data, metadata = {}) {
    super(data)
    this.__metadata__ = metadata
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return this._value_('url', 'about:blank') }
  get hasUrlSubdomain () { return this.__metadata__.hasUrlSubdomain }
  get name () { return this._value_('name', this.__metadata__.name) }
  get logos () { return this._value_('logos', this.__metadata__.logos) }
  get logo () { return this.logos.slice(-1)[0] }

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
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return this._value_('supportsUnreadActivity', true) }
  get supportsGuestNotifications () { return this._value_('supportsGuestNotifications', true) }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get reloadBehaviour () { return this._value_('reloadBehaviour', 'RESET_URL') }
  get useNativeWindowOpen () { return this._value_('useNativeWindowOpen', true) }
  get useContextIsolation () { return this._value_('useContextIsolation', true) }

  /* **************************************************************************/
  // Properties: User settings
  /* **************************************************************************/

  get hasNavigationToolbarDefault () { return this._value_('hasNavigationToolbarDefault', true) }
  get sleepableDefault () { return this._value_('sleepableDefault', true) }

  /* **************************************************************************/
  // Properties : Notifications
  /* **************************************************************************/

  get showNotificationsDefault () { return this._value_('showNotificationsDefault', true) }

  /* **************************************************************************/
  // Properties : Badges
  /* **************************************************************************/

  get showUnreadActivityBadgeDefault () { return this._value_('showUnreadActivityBadgeDefault', true) }
  get unreadActivityCountsTowardsAppUnreadDefault () { return this._value_('unreadActivityCountsTowardsAppUnreadDefault', true) }
}

module.exports = ContainerService
