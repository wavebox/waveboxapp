const MailboxReducer = require('./MailboxReducer')

class GenericMailboxReducer extends MailboxReducer {
  /**
  * Sets the display name for this account
  * @param mailbox: the mailbox to update
  * @param displayName: the display name
  */
  static setDisplayName (mailbox, displayName) {
    return mailbox.changeData({ displayName: displayName })
  }
}

module.exports = GenericMailboxReducer
