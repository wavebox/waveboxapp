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
  * @param service: the parent service
  * @param serviceData: the service data to update
  */
  static notificationPresented (service, serviceData) {
    return serviceData.changeData({ lastUnseenNotificationTime: new Date().getTime() })
  }

  /**
  * Clears the unseen notifications
  * @param service: the parent service
  * @param serviceData: the service data to update
  */
  static clearUnseenNotifications (service, serviceData) {
    return serviceData.changeData({ lastUnseenNotificationTime: null })
  }

  /* **************************************************************************/
  // Unread
  /* **************************************************************************/

  /**
  * Sets the unread count for the document title
  * @param service: the parent service
  * @param serviceData: the service data to update
  * @param count: the new count
  */
  static setDocumentTitleUnreadCount (service, serviceData, count) {
    return serviceData.changeData({ documentTitleUnreadCount: count })
  }

  /**
  * Sets whether the favicon indicates an unread activity
  * @param service: the parent service
  * @param serviceData: the service data to update
  * @param indicates: true if it indicates, false otherwise
  */
  static setFaviconIndicatesUnreadActivity (service, serviceData, indicates) {
    return serviceData.changeData({ faviconIndicatesUnreadActivity: indicates })
  }
}

export default ContainerServiceDataReducer
