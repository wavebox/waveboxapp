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
  // Notifications
  /* **************************************************************************/

  /**
  * Syncs all service notifications
  */
  syncAllServiceNotifications () { return {} }

  /**
  * Syncs the service notifications
  * @param serviceId: the id of the service
  */
  syncServiceNotifications (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Syncs the service notifications
  * @param serviceId: the id of the service
  * @param wait: the time to wait before the sync
  */
  syncServiceNotificationsAfter (serviceId, wait) {
    return { serviceId: serviceId, wait: wait }
  }
}

export default alt.createActions(TrelloActions)
