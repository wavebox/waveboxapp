import ServiceReducer from './ServiceReducer'

class MicrosoftMailServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'MicrosoftMailServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the basic profile info for this account
  * @param service: the service to update
  * @param userId: the users id
  * @param email: the user email address
  * @param userFullName: the users full name
  */
  static setProfileInfo (service, userId, email, userFullName) {
    return service.changeData({
      userId: userId,
      email: email,
      userFullName: userFullName
    })
  }

  /**
  * Sets the service avatar url
  * @param service: teh service to update
  * @param avatarUrl: the url of the avatar
  */
  static setServiceAvatarUrl (service, avatarUrl) {
    return service.changeData({
      serviceAvatarURL: avatarUrl
    })
  }

  /**
  * Sets the unread mode
  * @param service: the service to update
  * @param unreadMode: the new unread mode
  */
  static setUnreadMode (service, unreadMode) {
    if (service.unreadMode !== unreadMode) {
      return service.changeData({ unreadMode: unreadMode })
    }
  }
}

export default MicrosoftMailServiceReducer
