import ServiceDataReducer from './ServiceDataReducer'

class GoogleCalendarServiceDataReducer extends ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GoogleCalendarServiceDataReducer' }

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
}

export default GoogleCalendarServiceDataReducer
