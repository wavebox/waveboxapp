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
}

export default GenericServiceDataReducer
