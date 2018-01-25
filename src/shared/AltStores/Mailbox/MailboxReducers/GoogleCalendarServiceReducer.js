import ServiceReducer from './ServiceReducer'

class GoogleCalendarServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GoogleCalendarServiceReducer' }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * Sets that a notification was presented
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  */
  static notificationPresented (mailbox, service) {
    return service.changeData({ lastUnseenNotificationTime: new Date().getTime() })
  }

  /**
  * Clears the unseen notifications
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  */
  static clearUnseenNotifications (mailbox, service) {
    return service.changeData({ lastUnseenNotificationTime: null })
  }
}

export default GoogleCalendarServiceReducer
