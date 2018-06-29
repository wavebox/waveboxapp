import alt from '../alt'

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
  * Syncs all service profiles
  */
  syncAllServiceProfiles () { return {} }

  /**
  * Syncs a service profile
  * @param serviceId: the id of the service
  */
  syncServiceProfile (serviceId) {
    return { serviceId: serviceId }
  }

  /* **************************************************************************/
  // Connection
  /* **************************************************************************/

  /**
  * Starts listening for push updates
  * @param serviceId: the id of the service
  */
  connectService (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Stops listening for push updates
  * @param serviceId: the id of the service
  */
  disconnectService (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Starts all service watch calls
  */
  registerAllServiceWatches () { return {} }

  /**
  * Registers a watch call with google
  * @param serviceId: the id of the service
  */
  registerServiceWatch (serviceId) {
    return { serviceId: serviceId }
  }

  /* **************************************************************************/
  // Watchers
  /* **************************************************************************/

  /**
  * Handles a watch field changing on a service
  * @param serviceId: the id of the service
  */
  serviceSyncWatchFieldChange (serviceId, fields) {
    return { serviceId: serviceId, fields: fields }
  }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * Indicates that the mail history id has changed for a service causing a resync
  * @param serviceId: the id of the service
  * @param historyId=undefined: the new history id
  */
  mailHistoryIdChanged (serviceId, historyId = undefined) {
    return { serviceId: serviceId, historyId: historyId }
  }

  /**
  * Indicates that the mail count has changed for the service so a resyn should be done
  * @param serviceId: the id of the service
  * @param count=undefined: the new count
  */
  mailCountPossiblyChanged (serviceId, count = undefined) {
    return { serviceId: serviceId, count: count }
  }

  /**
  * Syncs the service messages
  * @param serviceId: the id of the service
  * @param forceSync=false: set to true to force the sync event even if the server reports no changes
  */
  syncServiceMessages (serviceId, forceSync = false) {
    return { serviceId: serviceId, forceSync: forceSync }
  }

  /**
  * Indicates that the mail history id changed from the watch vent
  * @param data: the data that came down the vent
  */
  mailHistoryIdChangedFromWatch (data) {
    // P.S. Sometimes the server doesn't send historyId - for example on re-connect
    return { email: data.emailAddress, historyId: data.historyId }
  }
}

export default alt.createActions(GoogleActions)
