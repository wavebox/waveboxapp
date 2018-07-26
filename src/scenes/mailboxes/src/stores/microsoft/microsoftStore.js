import alt from '../alt'
import actions from './microsoftActions'
import MicrosoftHTTP from './MicrosoftHTTP'
import { MICROSOFT_PROFILE_SYNC_INTERVAL, MICROSOFT_UNREAD_SYNC_INTERVAL } from 'shared/constants'
import uuid from 'uuid'
import { accountStore, accountActions } from 'stores/account'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import AuthReducer from 'shared/AltStores/Account/AuthReducers/AuthReducer'
import MicrosoftMailServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/MicrosoftMailServiceDataReducer'
import MicrosoftMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/MicrosoftMailServiceReducer'
import MicrosoftMailService from 'shared/Models/ACAccounts/Microsoft/MicrosoftMailService'

const REQUEST_TYPES = {
  PROFILE: 'PROFILE',
  MAIL: 'MAIL'
}

class MicrosoftStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.profilePoller = null
    this.mailPoller = null
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
      handleStartPolling: actions.START_POLLING_UPDATES,
      handleStopPolling: actions.STOP_POLLING_UPDATES,

      handleSyncAllServiceProfiles: actions.SYNC_ALL_SERVICE_PROFILES,
      handleSyncServiceProfile: actions.SYNC_SERVICE_PROFILE,

      handleSyncAllServiceMail: actions.SYNC_ALL_SERVICE_MAIL,
      handleSyncServiceMail: actions.SYNC_SERVICE_MAIL,
      handleSyncServiceMailAfter: actions.SYNC_SERVICE_MAIL_AFTER
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
  // Error Detection
  /* **************************************************************************/

  /**
  * Checks if an error is an invalid grant error
  * @param err: the error that was thrown
  * @return true if this error is invalid grant
  */
  isInvalidGrantError (err) {
    if (err) {
      if (err.status === 401) { return true }
    }
    return false
  }

  /* **************************************************************************/
  // Auth Utils
  /* **************************************************************************/

  /**
  * Gets the api authentication
  * @param serviceAuth: the service auth object
  * @return promise, provided with the access token
  */
  getAPIAuth (serviceAuth) {
    if (serviceAuth.authExpiryTime > new Date().getTime()) {
      return Promise.resolve(serviceAuth.accessToken)
    } else {
      return Promise.resolve()
        .then(() => MicrosoftHTTP.refreshAuthToken(serviceAuth.refreshToken, serviceAuth.authProtocolVersion))
        .then((res) => {
          accountActions.reduceAuth.defer(
            serviceAuth.id,
            AuthReducer.updateAuth,
            { access_token: res.access_token }
          )
          return Promise.resolve(res.access_token)
        })
    }
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
  handleStartPolling ({profiles, unread, notification}) {
    // Pollers
    clearInterval(this.profilePoller)
    this.profilePoller = setInterval(() => {
      actions.syncAllServiceProfiles.defer()
    }, MICROSOFT_PROFILE_SYNC_INTERVAL)
    actions.syncAllServiceProfiles.defer()

    clearInterval(this.mailPoller)
    this.mailPoller = setInterval(() => {
      actions.syncAllServiceMail.defer()
    }, MICROSOFT_UNREAD_SYNC_INTERVAL)
    actions.syncAllServiceMail.defer()
  }

  /**
  * Stops any running intervals
  */
  handleStopPolling () {
    // Pollers
    clearInterval(this.profilePoller)
    this.profilePoller = null
    clearInterval(this.mailPoller)
    this.mailPoller = null
  }

  /* **************************************************************************/
  // Handlers: Profiles
  /* **************************************************************************/

  handleSyncAllServiceProfiles () {
    this.preventDefault()
    accountStore
      .getState()
      .allServicesOfType(SERVICE_TYPES.MICROSOFT_MAIL)
      .forEach((service) => {
        actions.syncServiceProfile.defer(service.id)
      })
  }

  handleSyncServiceProfile ({ serviceId }) {
    if (this.hasOpenRequest(REQUEST_TYPES.PROFILE, serviceId)) {
      this.preventDefault()
      return
    }

    const serviceAuth = accountStore.getState().getMailboxAuthForServiceId(serviceId)
    if (!serviceAuth) {
      this.preventDefault()
      return
    }

    const requestId = this.trackOpenRequest(REQUEST_TYPES.PROFILE, serviceId)
    Promise.resolve()
      .then(() => this.getAPIAuth(serviceAuth))
      .then((accessToken) => { // STEP 1: Sync profile
        return Promise.resolve()
          .then(() => MicrosoftHTTP.fetchAccountProfile(accessToken))
          .then((profile) => {
            accountActions.reduceService.defer(
              serviceId,
              MicrosoftMailServiceReducer.setProfileInfo,
              profile.id,
              profile.userPrincipalName,
              profile.displayName
            )

            // Office365 is handled differently below...
            if (serviceAuth.isPersonalAccount) {
              accountActions.reduceService(
                serviceId,
                MicrosoftMailServiceReducer.setServiceAvatarUrl,
                `https://apis.live.net/v5.0/${profile.id}/picture?type=large` // This is funky because it's in base64 format but works
              )
            }
            return accessToken
          })
      })
      .then((accessToken) => { // Step 2: Sync drive info
        if (!serviceAuth.isPersonalAccount) {
          return Promise.resolve()
            .then(() => MicrosoftHTTP.fetchOffice365DriveUrl(accessToken))
            .then((driveUrl) => {
              accountActions.reduceAuth(
                serviceAuth.id,
                AuthReducer.updateAuth,
                { driveUrl: driveUrl }
              )
              return accessToken
            })
        } else {
          return Promise.resolve(accessToken)
        }
      })
      .then((accessToken) => { // Step 3: Sync avatar info
        if (!serviceAuth.isPersonalAccount) {
          return Promise.resolve()
            .then(() => MicrosoftHTTP.fetchOffice365Avatar(accessToken))
            .then((b64Image) => {
              accountActions.setServiceAvatarOnService(serviceId, b64Image)
              return accessToken
            })
        } else {
          return Promise.resolve(accessToken)
        }
      })
      .then(() => { // Finish-up
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, serviceId, requestId)
        this.emitChange()
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, serviceId, requestId)
        if (this.isInvalidGrantError(err)) {
          accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeInvalid)
        } else {
          console.error(err)
        }
        this.emitChange()
      })
  }

  /* **************************************************************************/
  // Handlers: Messages
  /* **************************************************************************/

  handleSyncAllServiceMail () {
    this.preventDefault()
    accountStore
      .getState()
      .allServicesOfType(SERVICE_TYPES.MICROSOFT_MAIL)
      .forEach((service) => {
        actions.syncServiceMail.defer(service.id)
      })
  }

  handleSyncServiceMail ({ serviceId }) {
    if (this.hasOpenRequest(REQUEST_TYPES.MAIL, serviceId)) {
      this.preventDefault()
      return
    }

    const accountState = accountStore.getState()
    const service = accountState.getService(serviceId)
    const serviceAuth = accountState.getMailboxAuthForServiceId(serviceId)
    if (!service || !serviceAuth) {
      this.preventDefault()
      return
    }

    const requestId = this.trackOpenRequest(REQUEST_TYPES.MAIL, serviceId)
    Promise.resolve()
      .then(() => this.getAPIAuth(serviceAuth))
      .then((accessToken) => {
        switch (service.unreadMode) {
          case MicrosoftMailService.UNREAD_MODES.INBOX_FOCUSED_UNREAD:
            return MicrosoftHTTP.fetchFocusedUnreadCountAndUnreadMessages(accessToken, 10)
          case MicrosoftMailService.UNREAD_MODES.INBOX_UNREAD:
          default:
            return MicrosoftHTTP.fetchInboxUnreadCountAndUnreadMessages(accessToken, 10)
        }
      })
      .then(({ unreadCount, messages }) => {
        this.trackCloseRequest(REQUEST_TYPES.MAIL, serviceId, requestId)
        accountActions.reduceServiceData(
          serviceId,
          MicrosoftMailServiceDataReducer.setUnreadInfo,
          unreadCount,
          messages
        )
        this.emitChange()
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.MAIL, serviceId, requestId)
        if (this.isInvalidGrantError(err)) {
          accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeInvalid)
        } else {
          console.error(err)
        }
        this.emitChange()
      })
  }

  handleSyncServiceMailAfter ({ serviceId, wait }) {
    this.preventDefault()
    setTimeout(() => {
      actions.syncServiceMail.defer(serviceId)
    }, wait)
  }
}

export default alt.createStore(MicrosoftStore, 'MicrosoftStore')
