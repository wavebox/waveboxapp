import ServiceDataReducer from './ServiceDataReducer'

class GenericServiceDataReducer extends ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GenericServiceDataReducer' }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * Sets that a notification was presented
  * @param service: the service to update
  */
  static notificationPresented (serviceData) {
    return serviceData.changeData({ lastUnseenNotificationTime: new Date().getTime() })
  }

  /**
  * Clears the unseen notifications
  * @param service: the service to update
  */
  static clearUnseenNotifications (serviceData) {
    return serviceData.changeData({ lastUnseenNotificationTime: null })
  }
}

export default GenericServiceDataReducer
