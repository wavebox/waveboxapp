import CoreACServiceData from '../CoreACServiceData'

class ContainerServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  get mergeChangesetOnActive () {
    return { lastUnseenNotificationTime: null }
  }

  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get documentTitleUnreadCount () { return this._value_('documentTitleUnreadCount', 0) }
  get faviconIndicatesUnreadActivity () { return this._value_('faviconIndicatesUnreadActivity', false) }
  get notificationIndicatesUnreadActivity () { return !!this._value_('lastUnseenNotificationTime', undefined) }

  /* **************************************************************************/
  // Unread getters
  /* **************************************************************************/

  /**
  * @override
  */
  getUnreadCount (service) {
    if (service.supportsWBGAPI && this.wbgapiUnreadCount > 0) { return this.wbgapiUnreadCount }
    return this.documentTitleUnreadCount
  }

  /**
  * @override
  */
  getHasUnreadActivity (service) {
    if (service.supportsWBGAPI && this.hasUnreadActivity) {
      return this.hasUnreadActivity
    } else if (service.container.faviconUnreadActivityRegexp && this.faviconIndicatesUnreadActivity) {
      return this.faviconIndicatesUnreadActivity
    } else if (service.container.html5NotificationsGenerateUnreadActivity && this.notificationIndicatesUnreadActivity) {
      return this.notificationIndicatesUnreadActivity
    } else {
      return false
    }
  }
}

export default ContainerServiceData
