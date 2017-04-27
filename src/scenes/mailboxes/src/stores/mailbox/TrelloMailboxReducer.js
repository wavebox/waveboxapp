import MailboxReducer from './MailboxReducer'

class TrelloMailboxReducer extends MailboxReducer {
  /**
  * Sets the basic profile info for this account
  * @param mailbox: the mailbox to update
  * @param username: the users username
  * @param email: the users email address
  * @param fullName: the users full name
  * @param initials: the users initials
  * @param avatar: { avatarSource, avatarHash } the users avatar info
  */
  static setProfileInfo (mailbox, username, email, fullName, initials, avatar) {
    return mailbox.changeData({
      username: username,
      email: email,
      fullName: fullName,
      avatar: avatar,
      initials: initials
    })
  }
}

export default TrelloMailboxReducer
