import ServiceReducer from './ServiceReducer'

class MicrosoftDefaultServiceReducer extends ServiceReducer {
  /**
  * Updates the unread info for gmail
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param unreadCount: the unreadCount for this mailbox
  * @param unreadMessages: the current set of unread messages
  */
  static setUnreadInfo (mailbox, service, unreadCount, unreadMessages) {
    return service.changeData({
      unreadCount: unreadCount,
      unreadMessages: unreadMessages.slice(0, 10) // There's no point storing all of them
    })
  }

  /**
  * Sets the unread mode
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param unreadMode: the new unread mode
  */
  static setUnreadMode (mailbox, service, unreadMode) {
    if (service.unreadMode !== unreadMode) {
      return service.changeData({ unreadMode: unreadMode })
    }
  }
}

export default MicrosoftDefaultServiceReducer
