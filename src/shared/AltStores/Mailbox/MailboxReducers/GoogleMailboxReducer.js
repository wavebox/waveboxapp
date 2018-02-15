import MailboxReducer from './MailboxReducer'

class GoogleMailboxReducer extends MailboxReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GoogleMailboxReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

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

  /**
  * Sets the mailbox authentication details
  * @param mailbox: the mailbox to update
  * @param auth: the auth info
  */
  static setAuth (mailbox, auth) {
    return mailbox.changeData({ auth: auth })
  }

  /**
  * Sets whether drive links should always be opened with default opener
  * @param mailbox: the mailbox to update
  * @param open: true to always open, false otherwise
  */
  static setOpenDriveLinksWithExternalBrowser (mailbox, open) {
    return mailbox.changeDataWithChangeset({
      openDriveLinksWithExternalBrowser: open
    })
  }
}

export default GoogleMailboxReducer
