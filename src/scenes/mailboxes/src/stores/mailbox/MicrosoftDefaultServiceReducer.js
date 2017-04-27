import ServiceReducer from './ServiceReducer'

class MicrosoftDefaultServiceReducer extends ServiceReducer {
  /**
  * Updates the unread info for gmail
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param messages: the messages to update
  */
  static setUnreadInfo (mailbox, service, messages) {
    return service.changeData({
      unreadCount: messages.length,
      unreadMessages: messages.slice(0, 10) // There's no point storing all of them
    })
  }
}

export default MicrosoftDefaultServiceReducer
