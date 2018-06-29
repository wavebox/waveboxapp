import ServiceReducer from './ServiceReducer'

class TrelloServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'TrelloServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the basic profile info for this account
  * @param service: the service to update
  * @param username: the users username
  * @param email: the users email address
  * @param fullName: the users full name
  * @param initials: the users initials
  * @param avatar: { avatarSource, avatarHash } the users avatar info
  */
  static setProfileInfo (service, username, email, fullName, initials, avatar) {
    return service.changeData({
      username: username,
      email: email,
      fullName: fullName,
      avatar: avatar,
      initials: initials
    })
  }

  /**
  * Sets the board info for this account
  * @param service: the service to update
  * @param boards: the boards to set
  */
  static setBoards (service, boards) {
    return service.changeData({ boards: boards })
  }

  /**
  * Sets the open board id
  * @param service: the service to update
  * @param boards: the boardId to open with
  */
  static setHomeBoardId (service, boardId) {
    return service.changeData({ homeBoardId: boardId })
  }
}

export default TrelloServiceReducer
