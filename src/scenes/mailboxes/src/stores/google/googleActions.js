const alt = require('../alt')

class GoogleActions {
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
  // Connection
  /* **************************************************************************/

  /**
  * Starts listening for push updates
  * @param mailboxId: the id of the mailbox
  */
  connectMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Stops listening for push updates
  * @param mailboxId: the id of the mailbox
  */
  disconnectMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Starts all mailbox watch calls
  */
  registerAllMailboxWatches () { return {} }

  /**
  * Registers a watch call with google
  * @param mailboxId: the id of the mailbox
  */
  registerMailboxWatch (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * Indicates that the mail history id has changed for a mailbox causing a resync
  * @param mailboxId: the id of the mailbox
  * @param forceSync=false: set to true to force the sync event if the client believes there are no changes
  */
  mailHistoryIdChanged (mailboxId, forceSync = false) {
    return { mailboxId: mailboxId, forceSync: forceSync }
  }

  /**
  * Indicates that the mail history id changed from the watch vent
  * @param data: the data that came down the vent
  */
  mailHistoryIdChangedFromWatch (data) {
    // You get the history id which you'd think to pass along however the sync system has
    // an escape hatch by checking if any of the deltas indicate a change so it's important
    // to requery for this
    return { email: data.emailAddress }
  }
}

module.exports = alt.createActions(GoogleActions)
