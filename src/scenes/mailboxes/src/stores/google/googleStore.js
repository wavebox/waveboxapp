import alt from '../alt'
import actions from './googleActions'
import GoogleHTTP from './GoogleHTTP'
import {
  GOOGLE_PROFILE_SYNC_INTERVAL,
  GOOGLE_MAILBOX_WATCH_INTERVAL
} from 'shared/constants'
import uuid from 'uuid'
import { accountStore, accountActions } from 'stores/account'
import { userStore } from 'stores/user'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import AuthReducer from 'shared/AltStores/Account/AuthReducers/AuthReducer'
import CoreGoogleMailboxServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/CoreGoogleMailServiceDataReducer'
import CoreGoogleMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/CoreGoogleMailServiceReducer'
import CoreGoogleMailService from 'shared/Models/ACAccounts/Google/CoreGoogleMailService'
import PowerMonitorService from 'shared/PowerMonitorService'

const REQUEST_TYPES = {
  PROFILE: 'PROFILE',
  MAIL: 'MAIL'
}

// @Thomas101#5
class GoogleStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.profilePoller = null
    this.watchPoller = null
    this.connected = new Map()
    this.openRequests = new Map()
    this.openWatches = new Map()

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

      handleConnectService: actions.CONNECT_SERVICE,
      handleDisconnectService: actions.DISCONNECT_SERVICE,
      handleRegisterAllServiceWatches: actions.REGISTER_ALL_SERVICE_WATCHES,
      handleRegisterServiceWatch: actions.REGISTER_SERVICE_WATCH,

      handleServiceSyncWatchFieldChange: actions.SERVICE_SYNC_WATCH_FIELD_CHANGE,

      handleMailHistoryIdChanged: actions.MAIL_HISTORY_ID_CHANGED,
      handleMailCountPossiblyChanged: actions.MAIL_COUNT_POSSIBLY_CHANGED,
      handleSyncServiceMessages: actions.SYNC_SERVICE_MESSAGES,
      handleMailHistoryIdChangedFromWatch: actions.MAIL_HISTORY_ID_CHANGED_FROM_WATCH
    })
  }

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  /**
  * Sets up the auth for a service
  * @param serviceAith: the serviceAuth
  * @return the auth object
  */
  getAPIAuth (serviceAuth) {
    if (!serviceAuth || !serviceAuth.hasAuth || serviceAuth.isAuthInvalid) { return undefined }
    return GoogleHTTP.generateAuth(
      serviceAuth.accessToken,
      serviceAuth.refreshToken,
      serviceAuth.authExpiryTime
    )
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
    if (err && typeof (err.message) === 'string') {
      if (userStore.getState().wireConfigSimpleGoogleAuth()) {
        return false
      }

      const isInvalid = err.message.indexOf('invalid_grant') !== -1 ||
        err.message.indexOf('Invalid Credentials') !== -1 ||
        err.message.indexOf('no credentials provided') !== -1 ||
        err.message.indexOf('Insufficient Permission') !== -1
      if (isInvalid) { return true }
    }

    return false
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
  handleStartPolling ({ profiles, unread, notification }) {
    // Pollers
    clearInterval(this.profilePoller)
    this.profilePoller = setInterval(() => {
      actions.syncAllServiceProfiles.defer()
    }, GOOGLE_PROFILE_SYNC_INTERVAL)
    actions.syncAllServiceProfiles.defer()

    clearInterval(this.watchPoller)
    this.watchPoller = setInterval(() => {
      actions.registerAllServiceWatches.defer()
    }, GOOGLE_MAILBOX_WATCH_INTERVAL)
    actions.registerAllServiceWatches.defer()
  }

  /**
  * Stops any running intervals
  */
  handleStopPolling () {
    // Pollers
    clearInterval(this.profilePoller)
    this.profilePoller = null
    clearInterval(this.watchPoller)
    this.watchPoller = null
  }

  /* **************************************************************************/
  // Handlers: Profiles
  /* **************************************************************************/

  handleSyncAllServiceProfiles () {
    this.preventDefault()
    const accountState = accountStore.getState()
    const all = [].concat(
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_MAIL),
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_INBOX)
    )
    all.forEach((service) => {
      actions.syncServiceProfile.defer(service.id)
    })
  }

  // @Thomas101#4
  handleSyncServiceProfile ({ serviceId }) {
    if (this.hasOpenRequest(REQUEST_TYPES.PROFILE, serviceId)) {
      this.preventDefault()
      return
    }

    const serviceAuth = accountStore.getState().getMailboxAuthForServiceId(serviceId)
    if (!serviceAuth) { return }

    accountActions.reduceService.defer(
      serviceId,
      CoreGoogleMailServiceReducer.copyProfileInfoFromAuth,
      serviceAuth.authEmail,
      serviceAuth.authAvatar
    )
  }

  /* **************************************************************************/
  // Handlers: Push server
  /* **************************************************************************/

  handleConnectService ({ serviceId }) {
    this.preventDefault()

    if (this.connected.has(serviceId)) { return }
    const rec = {
      lastSyncTS: 0,
      syncTO: null,
      loginTS: 0
    }
    this.connected.set(serviceId, rec)
    this._scheduleCycleSync(serviceId)
  }

  handleDisconnectService ({ serviceId }) {
    this.preventDefault()
    if (this.connected.has(serviceId)) {
      clearTimeout(this.connected.get(serviceId).syncTO)
      this.connected.delete(serviceId)
    }
  }

  handleRegisterAllServiceWatches () {
    this.preventDefault()
  }

  handleRegisterServiceWatch ({ serviceId }) {
    this.preventDefault()
  }

  /* **************************************************************************/
  // Handlers: Change watchers
  /* **************************************************************************/

  handleServiceSyncWatchFieldChange ({ serviceId, fields }) {
    this.preventDefault()
    actions.syncServiceMessages.defer(serviceId, true)
  }

  /* **************************************************************************/
  // Handlers: Mail Sync
  /* **************************************************************************/

  /**
  * @param service: the service we're runninga query on
  * @return the query to run on the google servers for the unread counts
  */
  mailAtomQueryForService (service) {
    switch (service.inboxType) {
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD_ATOM:
        return 'https://mail.google.com/mail/feed/atom/'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT_ATOM:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED_ATOM:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY_ATOM:
        return 'https://mail.google.com/mail/feed/atom/%5Eiim'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT_ATOM:
        return 'https://mail.google.com/mail/feed/atom/%5Esq_ig_i_personal'
      default:
        return 'https://mail.google.com/mail/feed/atom/'
    }
  }

  _scheduleCycleSync (serviceId) {
    const rec = this.connected.get(serviceId)
    if (!rec) { return }
    clearTimeout(rec.syncTO)
    rec.syncTO = setTimeout(() => {
      const rec = this.connected.get(serviceId)
      const now = new Date().getTime()

      if (PowerMonitorService.isSuspended) {
        this._scheduleCycleSync(serviceId)
        return
      }

      const accountState = accountStore.getState()
      if (accountState.isServiceSleeping(serviceId) === false) {
        if (rec && now - rec.lastSyncTS < 60000) {
          this._scheduleCycleSync(serviceId)
          return
        }
      }

      Promise.resolve()
        .then(() => this._syncServiceMessagesOnConnection(serviceId))
        .then(() => {
          this._scheduleCycleSync(serviceId)
        })
        .catch((ex) => {
          this._scheduleCycleSync(serviceId)
        })
    }, Math.round(Math.random() * 14000) + 2000)
  }

  _syncServiceMessagesOnConnection (serviceId) {
    const rec = this.connected.get(serviceId)
    const runLogin = rec && new Date().getTime() - rec.loginTS > 1000 * 60 * 30

    return Promise.resolve()
      .then(() => this._syncServiceMessages(serviceId, runLogin))
      .then(() => {
        const rec = this.connected.get(serviceId)
        const now = new Date().getTime()
        if (rec) {
          rec.lastSyncTS = now
          if (runLogin) {
            rec.loginTS = now
          }
        }
        return Promise.resolve()
      })
      .catch((ex) => {
        const rec = this.connected.get(serviceId)
        if (rec) {
          rec.lastSyncTS = new Date().getTime()
        }
        return Promise.reject(ex)
      })
  }

  _syncServiceMessages (serviceId, runLogin) {
    if (this.hasOpenRequest(REQUEST_TYPES.MAIL, serviceId)) {
      return Promise.reject(new Error('Request in-flight'))
    }

    const accountState = accountStore.getState()
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)
    const serviceAuth = accountState.getMailboxAuthForServiceId(serviceId)

    if (!service || !serviceData || !serviceAuth) {
      return Promise.reject(new Error('Core data unavailable'))
    }

    if (service.type === CoreGoogleMailService.SERVICE_TYPES.GOOGLE_INBOX) {
      return Promise.resolve()
    }

    const requestId = this.trackOpenRequest(REQUEST_TYPES.MAIL, serviceId)
    const atomUrl = this.mailAtomQueryForService(service) || 'https://mail.google.com/mail/feed/atom/'

    return Promise.resolve()
      .then(() => {
        if (runLogin) {
          return GoogleHTTP.fetchGmailBasicHTML(service.partitionId)
        } else {
          return Promise.resolve()
        }
      })
      .then(() => GoogleHTTP.fetchGmailAtomMessages(service.partitionId, atomUrl))
      .then(({ count, messages, timestamp }) => {
        // This could be outdated by now, but it's okay
        if (timestamp !== serviceData.historyId) {
          accountActions.reduceServiceData.defer(
            serviceId,
            CoreGoogleMailboxServiceDataReducer.updateUnreadInfo,
            timestamp,
            count,
            messages
          )
        }
      })
      .then(() => {
        this.trackCloseRequest(REQUEST_TYPES.MAIL, serviceId, requestId)
        accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeValid)
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.MAIL, serviceId, requestId)
        if (this.isInvalidGrantError(err)) {
          accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeInvalid)
        } else {
          console.error(err)
        }
        return Promise.reject(err)
      })
  }

  handleSyncServiceMessages ({ serviceId, forceSync }) {
    this.preventDefault()

    this._syncServiceMessagesOnConnection(serviceId).then(() => {
      this.emitChange()
    })
  }

  /* **************************************************************************/
  // Handlers: Mail change indicators
  /* **************************************************************************/

  handleMailCountPossiblyChanged ({ serviceId, count }) {
    this.preventDefault()

    // See if we can avoid a sync first
    if (count !== undefined) {
      const accountState = accountStore.getState()
      const service = accountState.getService(serviceId)
      const serviceData = accountState.getServiceData(serviceId)

      if (!service || !serviceData) { return }
      if (serviceData.getUnreadCount(service) === count) { return }
    }

    actions.syncServiceMessages.defer(serviceId)
  }

  handleMailHistoryIdChanged ({ serviceId, historyId }) {
    this.preventDefault()

    const serviceData = accountStore.getState().getServiceData(serviceId)
    if (historyId !== undefined && serviceData.historyId !== undefined) {
      if (historyId <= serviceData.historyId) { return }
    }

    actions.syncServiceMessages.defer(serviceId)
  }

  handleMailHistoryIdChangedFromWatch ({ email, historyId }) {
    this.preventDefault()

    const accountState = accountStore.getState()
    const all = [].concat(
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_MAIL),
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_INBOX)
    )

    all.forEach((service) => {
      const auth = accountState.getMailboxAuthForServiceId(service.id)
      if (auth && auth.authEmail === email) {
        actions.mailHistoryIdChanged.defer(service.id, historyId)
      }
    })
  }
}

export default alt.createStore(GoogleStore, 'GoogleStore')
