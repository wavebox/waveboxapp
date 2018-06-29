import alt from '../alt'
import actions from './trelloActions'
import { TRELLO_PROFILE_SYNC_INTERVAL, TRELLO_NOTIFICATION_SYNC_INTERVAL } from 'shared/constants'
import TrelloHTTP from './TrelloHTTP'
import uuid from 'uuid'
import Debug from 'Debug'
import { accountStore, accountActions } from '../account'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import TrelloServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/TrelloServiceDataReducer'
import TrelloServiceReducer from 'shared/AltStores/Account/ServiceReducers/TrelloServiceReducer'

const REQUEST_TYPES = {
  PROFILE: 'PROFILE',
  NOTIFICATION: 'NOTIFICATION'
}

class TrelloStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.profilePoller = null
    this.notificationPoller = null
    this.openRequests = new Map()

    /* **************************************/
    // Requests
    /* **************************************/

    /**
    * @param type: the type of request
    * @param serviceId: the id of the service
    * @return the number of open requests
    */
    this.openRequestCount = (type, serviceId) => {
      return (this.openRequests.get(`${type}:${serviceId}`) || []).length
    }

    /**
    * @param type: the type of request
    * @param serviceId: the id of the service
    * @return true if there are any open requests
    */
    this.hasOpenRequest = (type, serviceId) => {
      return this.openRequestCount(type, serviceId) !== 0
    }

    /* **************************************/
    // Listeners
    /* **************************************/

    this.bindListeners({
      handleStartPollSync: actions.START_POLLING_UPDATES,
      handleStopPollSync: actions.STOP_POLLING_UPDATES,

      handleSyncAllServiceProfiles: actions.SYNC_ALL_SERVICE_PROFILES,
      handleSyncServiceProfile: actions.SYNC_SERVICE_PROFILE,

      handleSyncAllServiceNotifications: actions.SYNC_ALL_SERVICE_NOTIFICATIONS,
      handleSyncServiceNotifications: actions.SYNC_SERVICE_NOTIFICATIONS,
      handleSyncServiceNotificationsAfter: actions.SYNC_SERVICE_NOTIFICATIONS_AFTER
    })
  }

  /* **************************************************************************/
  // Requests
  /* **************************************************************************/

  /**
  * Tracks that a request has been opened
  * @param type: the type of request
  * @param serviceId: the id of the service
  * @param requestId=auto: the unique id for this request
  * @return the requestId
  */
  trackOpenRequest (type, serviceId, requestId = uuid.v4()) {
    const key = `${type}:${serviceId}`
    const requestIds = (this.openRequests.get(key) || [])
    const updatedRequestIds = requestIds.filter((id) => id !== requestId).concat(requestId)
    this.openRequests.set(key, updatedRequestIds)
    return requestId
  }

  /**
  * Tracks that a request has been closed
  * @param type: the type of request
  * @param serviceId: the id of the service
  * @param requestId: the unique id for this request
  * @return the requestId
  */
  trackCloseRequest (type, serviceId, requestId) {
    const key = `${type}:${serviceId}`
    const requestIds = (this.openRequests.get(key) || [])
    const updatedRequestIds = requestIds.filter((id) => id !== requestId)
    this.openRequests.set(key, updatedRequestIds)
    return requestId
  }

  /* **************************************************************************/
  // Handlers: Pollers
  /* **************************************************************************/

  /**
  * Saves the intervals so they can be cancelled later
  * @profiles: the profiles interval
  * @param unread: the unread interval
  * @param notification: the notification interval
  */
  handleStartPollSync ({profiles, unread, notification}) {
    clearInterval(this.profilePoller)
    this.profilePoller = setInterval(() => {
      actions.syncAllServiceProfiles.defer()
    }, TRELLO_PROFILE_SYNC_INTERVAL)
    actions.syncAllServiceProfiles.defer()

    clearInterval(this.notificationPoller)
    this.notificationPoller = setInterval(() => {
      actions.syncAllServiceNotifications.defer()
    }, TRELLO_NOTIFICATION_SYNC_INTERVAL)
    actions.syncAllServiceNotifications.defer()
  }

  /**
  * Stops any running intervals
  */
  handleStopPollSync () {
    clearInterval(this.profilePoller)
    this.profilePoller = null
    clearInterval(this.notificationPoller)
    this.notificationPoller = null
  }

  /* **************************************************************************/
  // Handlers: Profiles
  /* **************************************************************************/

  handleSyncAllServiceProfiles () {
    this.preventDefault()
    accountStore
      .getState()
      .allServicesOfType(SERVICE_TYPES.TRELLO)
      .forEach((service) => {
        actions.syncServiceProfile.defer(service.id)
      })
  }

  handleSyncServiceProfile ({ serviceId }) {
    if (this.hasOpenRequest(REQUEST_TYPES.PROFILE, serviceId)) {
      this.preventDefault()
      return
    }

    const accountState = accountStore.getState()
    const serviceAuth = accountState.getMailboxAuthForServiceId(serviceId)
    if (!serviceAuth) {
      this.preventDefault()
      return
    }

    const requestId = this.trackOpenRequest(REQUEST_TYPES.PROFILE, serviceId)
    Promise.resolve()
      .then(() => TrelloHTTP.fetchAccountProfile(serviceAuth.authAppKey, serviceAuth.authToken))
      .then((response) => {
        accountActions.reduceService.defer(
          serviceId,
          TrelloServiceReducer.setProfileInfo,
          response.username,
          response.email,
          response.fullName,
          response.initials,
          { avatarSource: response.avatarSource, avatarHash: response.avatarHash }
        )
        return Promise.resolve()
      })
      .then(() => TrelloHTTP.fetchBoards(serviceAuth.authAppKey, serviceAuth.authToken, ['id', 'name', 'shortUrl'], 'open'))
      .then((response) => {
        accountActions.reduceService.defer(
          serviceId,
          TrelloServiceReducer.setBoards,
          response
        )
        return Promise.resolve()
      })
      .then(() => {
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, serviceId, requestId)
        this.emitChange()
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, serviceId, requestId)
        console.error(err)
        this.emitChange()
      })
  }

  /* **************************************************************************/
  // Handlers: Notifications
  /* **************************************************************************/

  handleSyncAllServiceNotifications () {
    this.preventDefault()
    accountStore
      .getState()
      .allServicesOfType(SERVICE_TYPES.TRELLO)
      .forEach((service) => {
        actions.syncServiceNotifications.defer(service.id)
      })
  }

  handleSyncServiceNotifications ({ serviceId }) {
    Debug.flagLog('trelloLogUnreadCounts', `[TRELLO:UNREAD] call ${serviceId}`)
    if (this.hasOpenRequest(REQUEST_TYPES.NOTIFICATION, serviceId)) {
      this.preventDefault()
      return
    }

    const accountState = accountStore.getState()
    const serviceAuth = accountState.getMailboxAuthForServiceId(serviceId)
    if (!serviceAuth) {
      this.preventDefault()
      return
    }

    Debug.flagLog('trelloLogUnreadCounts', `[TRELLO:UNREAD] start ${serviceId}`)
    const requestId = this.trackOpenRequest(REQUEST_TYPES.NOTIFICATION, serviceId)
    Promise.resolve()
      .then(() => TrelloHTTP.fetchUnreadNotifications(serviceAuth.authAppKey, serviceAuth.authToken))
      .then((notifications) => {
        this.trackCloseRequest(REQUEST_TYPES.NOTIFICATION, serviceId, requestId)
        accountActions.reduceServiceData.defer(
          serviceId,
          TrelloServiceDataReducer.setUnreadNotifications,
          notifications || []
        )
        this.emitChange()
        if (Debug.flags.trelloLogUnreadCounts) {
          console.log(`[TRELLO:UNREAD] success: ${serviceId}`, JSON.stringify(notifications, null, 2))
        }
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.NOTIFICATION, serviceId, requestId)
        console.error(err)
        this.emitChange()
        Debug.flagLog('trelloLogUnreadCounts', [`[TRELLO:UNREAD] error: ${serviceId}`, err])
      })
  }

  handleSyncServiceNotificationsAfter ({ serviceId, wait }) {
    this.preventDefault()
    setTimeout(() => {
      actions.syncServiceNotifications.defer(serviceId)
    }, wait)
  }
}

export default alt.createStore(TrelloStore, 'TrelloStore')
