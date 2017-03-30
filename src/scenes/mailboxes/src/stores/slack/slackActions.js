const alt = require('../alt')

class SlackActions {
  /* **************************************************************************/
  // Connection Open
  /* **************************************************************************/

  /**
  * Connects all mailboxes
  */
  connectAllMailboxes () { return {} }

  /**
  * Connects a mailbox
  * @param mailboxId: the id of the mailbox
  */
  connectMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Connection Close
  /* **************************************************************************/

  /**
  * Disconnects all mailboxes
  */
  disconnectAllMailboxes () { return {} }

  /**
  * Disconnects a mailbox
  * @param mailboxId: the id of the mailbox
  */
  disconnectMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Unread counts
  /* **************************************************************************/

  /**
  * Indicates that the unread counts may have changed
  * @param mailboxId: the id of the mailbox
  * @param allowMultiple=false: set to true if you want to allow this request to go out
  * even if one is already in progress
  */
  updateUnreadCounts (mailboxId, allowMultiple = false) {
    return { mailboxId: mailboxId, allowMultiple: allowMultiple }
  }
}

module.exports = alt.createActions(SlackActions)
