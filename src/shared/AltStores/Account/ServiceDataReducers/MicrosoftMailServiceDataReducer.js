import ServiceDataReducer from './ServiceDataReducer'

class MicrosoftMailServiceDataReducer extends ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'MicrosoftMailServiceDataReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Updates the unread info for gmail
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param unreadCount: the unreadCount for this mailbox
  * @param unreadMessages: the current set of unread messages
  */
  static setUnreadInfo (service, serviceData, unreadCount, unreadMessages) {
    return serviceData.changeData({
      unreadCount: unreadCount,
      unreadMessages: unreadMessages.slice(0, 10) // There's no point storing all of them
    })
  }
}

export default MicrosoftMailServiceDataReducer
