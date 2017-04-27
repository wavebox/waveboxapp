import alt from '../alt'

class TrelloActions {
  /* **************************************************************************/
  // Pollers
  /* **************************************************************************/

  /**
  * Starts polling the server for updates on a periodic basis
  */
  startPollingUpdates () { return {} }

  /**
  * Stops polling the server for updates
  */
  stopPollingUpdates () { return {} }

  /* **************************************************************************/
  // Profiles
  /* **************************************************************************/

  /**
  * Syncs all mailbox profiles
  */
  syncAllMailboxProfiles () { return {} }

  /**
  * Syncs a mailbox profile
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxProfile (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * Syncs all mailbox notifications
  */
  syncAllMailboxNotifications () { return {} }

  /**
  * Syncs the mailbox notifications
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxNotifications (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Syncs the mailbox notifications
  * @param mailboxId: the id of the mailbox
  * @param wait: the time to wait before the sync
  */
  syncMailboxNotificationsAfter (mailboxId, wait) {
    return { mailboxId: mailboxId, wait: wait }
  }
}

export default alt.createActions(TrelloActions)
