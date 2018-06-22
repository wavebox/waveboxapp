import ServiceDataReducer from './ServiceDataReducer'

class GoogleHangoutsServiceDataReducer extends ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GoogleHangoutsServiceDataReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the unread count
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param count: the new count
  */
  static setUnreadCount (mailbox, service, count) {
    return service.changeData({
      unreadCount: count,
      unreadCountUpdateTime: new Date().getTime()
    })
  }
}

export default GoogleHangoutsServiceDataReducer
