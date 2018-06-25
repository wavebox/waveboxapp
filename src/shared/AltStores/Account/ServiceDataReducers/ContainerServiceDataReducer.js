import ServiceDataReducer from './ServiceDataReducer'

class ContainerServiceDataReducer extends ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'ContainerServiceDataReducer' }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * Sets that a notification was presented
  * @param serviceData: the service data to update
  */
  static notificationPresented (serviceData) {
    return serviceData.changeData({ lastUnseenNotificationTime: new Date().getTime() })
  }

  /**
  * Clears the unseen notifications
  * @param serviceData: the service data to update
  */
  static clearUnseenNotifications (serviceData) {
    return serviceData.changeData({ lastUnseenNotificationTime: null })
  }

  /* **************************************************************************/
  // Unread
  /* **************************************************************************/

  /**
  * Sets the unread count for the document title
  * @param serviceData: the service data to update
  * @param count: the new count
  */
  static setDocumentTitleUnreadCount (serviceData, count) {
    return serviceData.changeData({ documentTitleUnreadCount: count })
  }

  /**
  * Sets whether the favicon indicates an unread activity
  * @param serviceData: the service data to update
  * @param indicates: true if it indicates, false otherwise
  */
  static setFaviconIndicatesUnreadActivity (serviceData, indicates) {
    return serviceData.changeData({ faviconIndicatesUnreadActivity: indicates })
  }
}

export default ContainerServiceDataReducer
