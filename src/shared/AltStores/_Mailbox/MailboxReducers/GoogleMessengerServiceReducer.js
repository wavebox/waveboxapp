import ServiceReducer from './ServiceReducer'

class GoogleMessengerServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GoogleMessengerServiceReducer' }

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

export default GoogleMessengerServiceReducer
