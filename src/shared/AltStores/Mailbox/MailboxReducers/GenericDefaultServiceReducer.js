import ServiceReducer from './ServiceReducer'

class GenericDefaultServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Settings
  /* **************************************************************************/

  /**
  * Updates the url for the service
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param url: the url to set
  */
  static setUrl (mailbox, service, url) {
    return service.changeData({ url: url })
  }

  /**
  * Updates the setting to show the navigation toolbar
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param has: true to if it has the toolbar
  */
  static setHasNavigationToolbar (mailbox, service, has) {
    return service.changeData({ hasNavigationToolbar: has })
  }

  /**
  * Updates the setting to show adaptor data
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param supports: true to supports, false otherwise
  */
  static setsupportsGuestConfig (mailbox, service, supports) {
    return service.changeData({ supportsGuestConfig: supports })
  }

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

export default GenericDefaultServiceReducer
