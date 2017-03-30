const googleActions = require('../google/googleActions')
const ServiceReducer = require('./ServiceReducer')

class GoogleDefaultServiceReducer extends ServiceReducer {
  /**
  * Updates the unread info for gmail
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param historyId: the new history id
  * @param unreadCount: the current unread count
  * @param unreadThreads: an array of full thread infos that have not been read
  */
  static updateUnreadInfo (mailbox, service, historyId, unreadCount, unreadThreads) {
    return service.changeData({
      historyId: historyId,
      unreadCount: unreadCount,
      unreadThreads: unreadThreads
    })
  }

  /**
  * Sets the history id on the service
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param historyId: the new history id
  */
  static setHistoryId (mailbox, service, historyId) {
    if (service.historyId !== historyId) {
      return service.changeData({ historyId: historyId })
    }
  }

  /**
  * Sets the unread mode
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param unreadMode: the new unread mode
  */
  static setUnreadMode (mailbox, service, unreadMode) {
    if (mailbox.unreadMode !== unreadMode) {
      googleActions.mailHistoryIdChanged.defer(mailbox.id, true)
      return service.changeData({ unreadMode: unreadMode })
    }
  }
}

module.exports = GoogleDefaultServiceReducer
