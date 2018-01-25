import ServiceReducer from './ServiceReducer'

class ContainerDefaultServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'ContainerDefaultServiceReducer' }

  /* **************************************************************************/
  // Settings
  /* **************************************************************************/

  /**
  * Updates the setting to show the navigation toolbar
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param has: true to if it has the toolbar
  */
  static setHasNavigationToolbar (mailbox, service, has) {
    return service.changeData({ hasNavigationToolbar: has })
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

export default ContainerDefaultServiceReducer
