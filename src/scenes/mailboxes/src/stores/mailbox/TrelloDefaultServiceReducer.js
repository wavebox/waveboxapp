const ServiceReducer = require('./ServiceReducer')

class TrelloDefaultServiceReducer extends ServiceReducer {
  /**
  * Sets the unread notifications
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param notifications: the updated notifications
  */
  static setUnreadNotifications (mailbox, service, notifications) {
    return service.changeData({
      unreadNotifications: notifications.filter((notif) => {
        return notif.unread === true || notif.unread === undefined
      })
    })
  }
}

module.exports = TrelloDefaultServiceReducer
