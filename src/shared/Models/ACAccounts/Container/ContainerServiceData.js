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
    const val = parseInt(
      service.supportsWBGAPI && this.wbgapiUnreadCount > 0
        ? this.wbgapiUnreadCount
        : this.documentTitleUnreadCount
    )
    return isNaN(val) ? 0 : val
  }

  /**
  * @override
  */
  getHasUnreadActivity (service) {
    if (service.supportsWBGAPI && this.wbgapiHasUnreadActivity) {
      return this.wbgapiHasUnreadActivity
    } else if (service.faviconUnreadActivityRegexp && this.faviconIndicatesUnreadActivity) {
      return this.faviconIndicatesUnreadActivity
    } else if (service.html5NotificationsGenerateUnreadActivity && this.notificationIndicatesUnreadActivity) {
      return this.notificationIndicatesUnreadActivity
    } else {
      return false
    }
  }
}

export default ContainerServiceData
