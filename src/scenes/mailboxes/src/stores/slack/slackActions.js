import alt from '../alt'

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
  // Reconnection
  /* **************************************************************************/

  /**
  * Reconnects a mailbox by tearing it down and bringing it back up again
  * @param mailboxId: the id of the mailbox
  */
  reconnectMailbox (mailboxId) {
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

  /* **************************************************************************/
  // Notification
  /* **************************************************************************/

  /**
  * Sends a slack notification on behalf of a mailbox
  * @param mailboxId: the id of the mailbox
  * @param message: the message that came off slack
  */
  scheduleNotification (mailboxId, message) {
    return {
      mailboxId: mailboxId,
      message: message
    }
  }

  /**
  * Schedules a html5 notification
  * @param mailboxId: the id of the mailbox
  * @param notificationId: the id of the html5 notification
  * @param notification: the notification object
  * @param clickHandler: the click handler provided
  */
  scheduleHTML5Notification (mailboxId, notificationId, notification, clickHandler) {
    return {
      mailboxId: mailboxId,
      notificationId: notificationId,
      notification: notification,
      clickHandler: clickHandler
    }
  }
}

export default alt.createActions(SlackActions)
