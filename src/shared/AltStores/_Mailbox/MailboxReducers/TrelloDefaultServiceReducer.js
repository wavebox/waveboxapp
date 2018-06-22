import ServiceReducer from './ServiceReducer'

class TrelloDefaultServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'TrelloDefaultServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

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

  /**
  * Sets the board info for this account
  * @param mailbox: the mailbox to update
  * @param service: the service to update
  * @param boards: the boards to set
  */
  static setBoards (mailbox, service, boards) {
    return service.changeData({
      boards: boards
    })
  }

  /**
  * Sets the open board id
  * @param mailbox: the mailbox to update
  * @param service: the service to update
  * @param boards: the boardId to open with
  */
  static setHomeBoardId (mailbox, service, boardId) {
    return service.changeData({
      homeBoardId: boardId
    })
  }
}

export default TrelloDefaultServiceReducer
