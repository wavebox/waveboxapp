const CoreService = require('../CoreService')
const ContainerServiceAdaptor = require('./ContainerServiceAdaptor')

class ContainerDefaultService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.DEFAULT }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat([
      'documentTitleUnreadCount',
      'faviconIndicatesUnreadActivity',
      'lastUnseenNotificationTime'
    ])
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param ...args: the args to pass to CoreService
  */
  constructor (...args) {
    super(...args)
    this.__adaptors__ = undefined
  }

  /* **************************************************************************/
  // Properties: Container
  /* **************************************************************************/

  get container () { return this.__metadata__.container }
  get containerService () { return this.container.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get sleepable () { return this._value_('sleepable', this.containerService.sleepableDefault) }
  get hasNavigationToolbar () { return this._value_('hasNavigationToolbar', this.containerService.hasNavigationToolbarDefault) }

  /* **************************************************************************/
  // Properties: Url
  /* **************************************************************************/

  get url () { return this.containerService.getUrlWithSubdomain(this.urlSubdomain) }
  get urlSubdomain () { return this.__metadata__.urlSubdomain }
  get restoreLastUrlDefault () { return this.containerService.restoreLastUrlDefault }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return this.containerService.name }
  get humanizedTypeShort () { return this.containerService.name }
  get humanizedLogos () { return this.containerService.logos }
  get humanizedLogo () { return this.containerService.logo }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return this.containerService.supportsUnreadActivity }
  get supportsGuestNotifications () { return this.containerService.supportsGuestNotifications }
  get supportsUnreadCount () { return this.containerService.supportsUnreadCount }
  get supportsTrayMessages () { return this.containerService.supportsTrayMessages }
  get supportsGuestConfig () { return this.containerService.supportsGuestConfig }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get reloadBehaviour () { return CoreService.RELOAD_BEHAVIOURS[this.containerService.reloadBehaviour] || super.reloadBehaviour }
  get useAsyncAlerts () { return this.containerService.useAsyncAlerts }
  get mergeChangesetOnActive () { return { lastUnseenNotificationTime: null } }
  get html5NotificationsGenerateUnreadActivity () { return this.containerService.html5NotificationsGenerateUnreadActivity }

  /* **************************************************************************/
  // Properties : Unread
  /* **************************************************************************/

  get documentTitleHasUnread () { return this.containerService.documentTitleHasUnread }
  get documentTitleUnreadBlinks () { return this.containerService.documentTitleUnreadBlinks }
  get unreadCount () {
    // Take super first as the api may have set it
    const superUnread = super.unreadCount
    if (superUnread && superUnread > 0) { return superUnread }
    return this._value_('documentTitleUnreadCount', 0)
  }
  get faviconUnreadActivityRegexp () { return this.containerService.faviconUnreadActivityRegexp }

  /* **************************************************************************/
  // Properties: Adaptors
  /* **************************************************************************/

  get adaptors () {
    // Lazy load this - most threads wont use it
    if (this.__adaptors__ === undefined) {
      this.__adaptors__ = this.containerService.adaptors.map((adaptorConfig) => {
        return new ContainerServiceAdaptor(adaptorConfig)
      })
    }
    return this.__adaptors__
  }

  /* **************************************************************************/
  // Properties : Notifications
  /* **************************************************************************/

  get showNotifications () { return this._migrationValue_('showNotifications', this.containerService.showNotificationsDefault) }

  /* **************************************************************************/
  // Properties : Badges
  /* **************************************************************************/

  get showUnreadBadge () { return this._migrationValue_('showUnreadBadge', this.containerService.showUnreadBadgeDefault) }
  get unreadCountsTowardsAppUnread () { return this._migrationValue_('unreadCountsTowardsAppUnread', this.containerService.unreadCountsTowardsAppUnreadDefault) }
  get showUnreadActivityBadge () { return this._migrationValue_('showUnreadActivityBadge', this.containerService.showUnreadActivityBadgeDefault) }
  get unreadActivityCountsTowardsAppUnread () { return this._migrationValue_('unreadActivityCountsTowardsAppUnread', this.containerService.unreadActivityCountsTowardsAppUnreadDefault) }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get hasUnreadActivity () {
    if (this.supportsGuestConfig) {
      return this.guestConfig.hasUnreadActivity
    } else if (this.faviconUnreadActivityRegexp) {
      return this._value_('faviconIndicatesUnreadActivity', false)
    } else if (this.html5NotificationsGenerateUnreadActivity) {
      return !!this._value_('lastUnseenNotificationTime', undefined)
    } else {
      return false
    }
  }
}

module.exports = ContainerDefaultService
