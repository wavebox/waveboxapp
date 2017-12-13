const CoreService = require('../CoreService')

class ContainerDefaultService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.DEFAULT }
  static get mergeChangesetOnActive () {
    return { lastUnseenNotificationTime: null }
  }

  /* **************************************************************************/
  // Properties: Container
  /* **************************************************************************/

  get container () { return this.__metadata__.container }
  get containerService () { return this.container.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) }

  /* **************************************************************************/
  // Properties: Container
  /* **************************************************************************/

  get url () { return this.containerService.getUrlWithSubdomain(this.urlSubdomain) }
  get urlSubdomain () { return this.__metadata__.urlSubdomain }
  get sleepable () { return this._value_('sleepable', this.containerService.sleepableDefault) }
  get hasNavigationToolbar () { return this._value_('hasNavigationToolbar', this.containerService.hasNavigationToolbarDefault) }

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

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get reloadBehaviour () { return CoreService.RELOAD_BEHAVIOURS[this.containerService.reloadBehaviour] || super.reloadBehaviour }

  /* **************************************************************************/
  // Properties : Notifications
  /* **************************************************************************/

  get showNotifications () { return this._migrationValue_('showNotifications', this.containerService.showNotificationsDefault) }

  /* **************************************************************************/
  // Properties : Badges
  /* **************************************************************************/

  get showUnreadActivityBadge () { return this._migrationValue_('showUnreadActivityBadge', this.containerService.showUnreadActivityBadgeDefault) }
  get unreadActivityCountsTowardsAppUnread () { return this._migrationValue_('unreadActivityCountsTowardsAppUnread', this.containerService.unreadActivityCountsTowardsAppUnreadDefault) }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get hasUnreadActivity () { return !!this._value_('lastUnseenNotificationTime', undefined) }
}

module.exports = ContainerDefaultService
