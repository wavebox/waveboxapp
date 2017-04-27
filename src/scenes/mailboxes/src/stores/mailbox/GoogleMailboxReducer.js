import MailboxReducer from './MailboxReducer'

class GoogleMailboxReducer extends MailboxReducer {
  /**
  * Sets the basic profile info for this account
  * @param mailbox: the mailbox to update
  * @param email: the users email address
  * @param avatar: the users avatar url
  */
  static setProfileInfo (mailbox, email, avatar) {
    if (mailbox.email !== email || mailbox.avatarURL !== avatar) {
      return mailbox.changeData({
        email: email,
        avatar: avatar
      })
    } else {
      return undefined
    }
  }

  /**
  * Indicates that the authentication information on the mailbox is invalid
  * @param mailbox: the mailbox to update
  */
  static invalidateAuth (mailbox) {
    if (!mailbox.isAuthenticationInvalid) {
      return mailbox.changeDataWithChangeset({
        auth: { isInvalid: true }
      })
    }
  }

  /**
  * Indicates that the authentication information on the mailbox is valid
  * @param mailbox: the mailbox to update
  */
  static revalidateAuth (mailbox) {
    if (mailbox.isAuthenticationInvalid) {
      return mailbox.changeDataWithChangeset({
        auth: { isInvalid: false }
      })
    }
  }
}

export default GoogleMailboxReducer
