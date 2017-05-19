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
  * Updates the setting to open new windows externally
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param openExternal: true to open windows externally
  */
  static setOpenWindowsExternally (mailbox, service, openExternal) {
    return service.changeData({ openWindowsExternally: openExternal })
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
