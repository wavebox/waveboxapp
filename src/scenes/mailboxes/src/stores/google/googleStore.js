import alt from '../alt'
import actions from './googleActions'
import GoogleHTTP from './GoogleHTTP'
import {
  GOOGLE_PROFILE_SYNC_INTERVAL,
  GOOGLE_MAILBOX_WATCH_INTERVAL,
  GOOGLE_MAILBOX_WATCH_THROTTLE
} from 'shared/constants'
import uuid from 'uuid'
import ServerVent from 'Server/ServerVent'
import { accountStore, accountActions } from 'stores/account'
import { userStore } from 'stores/user'
import Debug from 'Debug'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import AuthReducer from 'shared/AltStores/Account/AuthReducers/AuthReducer'
import CoreGoogleMailServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/CoreGoogleMailServiceDataReducer'
import CoreGoogleMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/CoreGoogleMailServiceReducer'
import CoreGoogleMailService from 'shared/Models/ACAccounts/Google/CoreGoogleMailService'

const REQUEST_TYPES = {
  PROFILE: 'PROFILE',
  MAIL: 'MAIL'
}
const LOG_PFX = '[GSS]'

class GoogleStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.profilePoller = null
    this.watchPoller = null
    this.openRequests = new Map()
    this.openWatches = new Map()
    this.simpleUpdaters = new Map()

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
  // Simple
  /* **************************************************************************/

  /**
  * Schedules the next simple sync
  * @param serviceId: the serviceId
  * @param immediate=false: set to true to run almost immediately
  * @return the timer ref
  */
  _scheduleNextSimpleSync (serviceId, immediate = false) {
    const userState = userStore.getState()
    const interval = immediate ? 0 : userState.wireConfigSimpleGoogleAuthUpdateInterval()
    const mod = Math.random() >= 0.5 ? 1 : -1
    const drift = Math.floor(Math.random() * userState.wireConfigSimpleGoogleAuthUpdateDrift()) * mod
    const wait = interval + drift

    return setTimeout(() => {
      Promise.resolve()
        .then(() => {
          return userStore.getState().wireConfigSimpleGoogleAuth()
            ? this._runSimpleSync(serviceId)
            : Promise.resolve() // no-op
        })
        .then(() => {
          this.simpleUpdaters.set(serviceId, this._scheduleNextSimpleSync(serviceId))
        })
        .catch((ex) => {
          this.simpleUpdaters.set(serviceId, this._scheduleNextSimpleSync(serviceId))
        })
    }, wait)
  }

  /**
  * Runs an on-demand simple sync
  * @param serviceId: the id of the service
  */
  _runOnDemandSimpleSync (serviceId) {
    if (!this.simpleUpdaters.has(serviceId)) { return }
    clearTimeout(this.simpleUpdaters.get(serviceId))
    this.simpleUpdaters.set(serviceId, this._scheduleNextSimpleSync(serviceId, true))
  }

  /**
  * Runs the simple sync
  * @param serviceId: the id of the service
  * @return promise
  */
  _runSimpleSync (serviceId) {
    return Promise.resolve()
      .then(() => {
        const service = accountStore.getState().getService(serviceId)
        return service
          ? Promise.resolve(service)
          : Promise.reject(new Error('Service unavailble'))
      })
      .then((service) => {
        const url = this.mailAtomQueryForService(service) || 'https://mail.google.com/mail/feed/atom/'
        return GoogleHTTP.fetchGmailAtomUnreadInfo(service.partitionId, url)
      })
      .then(({ count, timestamp, threads }) => {
        const serviceData = accountStore.getState().getServiceData(serviceId)

        if (timestamp !== serviceData.historyId) {
          accountActions.reduceServiceData.defer(serviceId, CoreGoogleMailServiceDataReducer.updateHistoryId, timestamp)
          accountActions.reduceServiceData.defer(serviceId, CoreGoogleMailServiceDataReducer.updateUnreadThreads, threads)
        }

        if (accountStore.getState().isServiceSleeping(serviceId)) {
          accountActions.reduceServiceData.defer(serviceId, CoreGoogleMailServiceDataReducer.updateUnreadCount, count)
        }

        return Promise.resolve()
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

  handleSyncServiceProfile ({ serviceId }) {
    if (this.hasOpenRequest(REQUEST_TYPES.PROFILE, serviceId)) {
      this.preventDefault()
      return
    }

    const serviceAuth = accountStore.getState().getMailboxAuthForServiceId(serviceId)
    const auth = this.getAPIAuth(serviceAuth)
    if (!auth) { return }

    const requestId = this.trackOpenRequest(REQUEST_TYPES.PROFILE, serviceId)
    Promise.resolve()
      .then(() => GoogleHTTP.fetchAccountProfile(auth))
      .then((response) => {
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, serviceId, requestId)
        accountActions.reduceAuth(
          serviceAuth.id,
          AuthReducer.makeValid
        )
        accountActions.reduceService(
          serviceId,
          CoreGoogleMailServiceReducer.setProfileInfo,
          response.email,
          response.picture
        )
        this.emitChange()
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, serviceId, requestId)
        if (this.isInvalidGrantError(err)) {
          accountActions.reduceAuth(
            serviceAuth.id,
            AuthReducer.makeInvalid
          )
        } else {
          console.error(err)
        }
        this.emitChange()
      })
  }

  /* **************************************************************************/
  // Handlers: Push server
  /* **************************************************************************/

  handleConnectService ({ serviceId }) {
    this.preventDefault()
    const serviceAuth = accountStore.getState().getMailboxAuthForServiceId(serviceId)
    if (!serviceAuth) { return }

    ServerVent.startListeningForGooglePushUpdates(
      serviceId,
      serviceAuth.authEmail,
      serviceAuth.pushToken
    )

    if (!this.simpleUpdaters.has(serviceId)) {
      this.simpleUpdaters.set(serviceId, this._scheduleNextSimpleSync(serviceId))
    }
  }

  handleDisconnectService ({ serviceId }) {
    this.preventDefault()
    ServerVent.stopListeningForGooglePushUpdates(serviceId)

    if (this.simpleUpdaters.has(serviceId)) {
      const timer = this.simpleUpdaters.get(serviceId)
      clearTimeout(timer)
      this.simpleUpdaters.delete(serviceId)
    }
  }

  handleRegisterAllServiceWatches () {
    this.preventDefault()
    const accountState = accountStore.getState()
    const all = [].concat(
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_MAIL),
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_INBOX)
    )
    all.forEach((service) => {
      actions.registerServiceWatch.defer(service.id)
    })
  }

  handleRegisterServiceWatch ({ serviceId }) {
    this.preventDefault()
    const now = new Date().getTime()
    if (now - (this.openWatches.get(serviceId) || 0) < GOOGLE_MAILBOX_WATCH_THROTTLE) { return }

    const serviceAuth = accountStore.getState().getMailboxAuthForServiceId(serviceId)
    const auth = this.getAPIAuth(serviceAuth)
    if (!auth) { return }

    // Optimistically set this. A machine with lots of accounts can take time to connect
    // and we can end up duplicating calls.
    this.openWatches.set(serviceId, now)
    Promise.resolve()
      .then(() => GoogleHTTP.watchAccount(auth))
      .then(() => {
        accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeValid)
      })
      .catch((err) => {
        this.openWatches.delete(serviceId)
        if (this.isInvalidGrantError(err)) {
          accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeInvalid)
        } else if (err && typeof (err.message) === 'string' && err.message.startsWith('Only one user push notification client allowed per developer')) {
          console.warn('Failed to join Google watch channel but recovering gracefully.', err)
          /* no-op */
        } else {
          console.error(err)
        }
      })
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
  * Trims a mail thread to be in the standard format that we use
  * @param thread: the full thread info that came off google
  * @return the trimmed down version
  */
  trimMailThread (thread) {
    const latestMessage = thread.messages[thread.messages.length - 1]
    return {
      id: thread.id,
      historyId: thread.historyId,
      latestMessage: Object.assign({
        id: latestMessage.id,
        historyId: latestMessage.historyId,
        internalDate: latestMessage.internalDate,
        snippet: latestMessage.snippet,
        labelIds: latestMessage.labelIds
      }, latestMessage.payload.headers.reduce((acc, header) => {
        const name = header.name.toLowerCase()
        if (name === 'subject' || name === 'from' || name === 'to') {
          acc[name] = header.value
        }
        return acc
      }, {}))
    }
  }

  /**
  * Looks through the history from gmail to see if the records represent a change
  * in unread counts. We do this by filtering the history records
  * Out of the history record we get a bunch of changes to the messages. These
  * are time ordered by the gmail api. We basically look to see if any of these
  * changes affect the labels that we're looking on
  * @param labelIds: the label ids that are applicable for this service
  * @param history: the history record from the gmail api
  * @return true if the history indicates that unread has changed, false otherwise
  */
  hasMailUnreadChangedFromHistory (labelIds, history) {
    if (!history || !history.length) { return false }
    labelIds = new Set(labelIds)
    const changedLabelIds = history
      .reduce((acc, record) => {
        if (record.messagesAdded) {
          return acc.concat(record.messagesAdded)
        } else if (record.labelsRemoved) {
          return acc.concat(record.labelsRemoved)
        } else if (record.labelsAdded) {
          return acc.concat(record.labelsAdded)
        } else {
          return acc
        }
      }, [])
      .reduce((acc, record) => {
        return acc.concat(record.message.labelIds, record.labelIds)
      }, [])
    return Array.from(new Set(changedLabelIds)).findIndex((changedLabelId) => {
      return labelIds.has(changedLabelId)
    }) !== -1
  }

  /**
  * @param service: the service we're running a query on
  * @return an array of label ids that the service expects to query gmail with
  */
  mailLabelIdsForService (service) {
    if (service.hasCustomUnreadLabelWatch) { return service.customUnreadLabelWatchArray }
    switch (service.inboxType) {
      case CoreGoogleMailService.INBOX_TYPES.GMAIL__ALL:
        return ['INBOX']
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD_ATOM:
        return ['INBOX', 'UNREAD']
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT_ATOM:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED_ATOM:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY_ATOM:
        return ['INBOX', 'UNREAD', 'IMPORTANT']
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT_ATOM:
        return ['INBOX', 'UNREAD', 'CATEGORY_PERSONAL']
      case CoreGoogleMailService.INBOX_TYPES.GINBOX_UNBUNDLED:
        return ['INBOX', 'UNREAD']
      default:
        return ['INBOX']
    }
  }

  /**
  * Gets the label id that can be used in a label query for unread count
  * @param service: the service we're running the query on
  * @return the label id or undefined
  */
  mailLabelForLabelQuery (service) {
    if (service.customUnreadCountFromLabel && service.customUnreadCountLabel) {
      return (service.customUnreadCountLabel || '').toUpperCase()
    }
    switch (service.inboxType) {
      case CoreGoogleMailService.INBOX_TYPES.GMAIL__ALL:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD:
        return 'INBOX'
      default:
        return undefined
    }
  }

  /**
  * Gets the field in the label response that indicates unread
  * @param service: the service we're running the query on
  * @return the name of the field the unread count will be stored within
  */
  mailLabelUnreadCountField (service) {
    if (service.customUnreadCountFromLabel && service.customUnreadCountLabel) {
      return service.customUnreadCountLabelField
    }
    switch (service.inboxType) {
      case CoreGoogleMailService.INBOX_TYPES.GMAIL__ALL:
        return 'threadsTotal'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD:
        return 'threadsUnread'
      default:
        return undefined
    }
  }

  /**
  * @param service: the service we're running a query on
  * @return true if this service can be queried just with the label. False otherwise
  */
  canFetchUnreadCountFromLabel (service) {
    return !this.isUsingCustomSyncConfig(service) && !!this.mailLabelForLabelQuery(service)
  }

  /**
  * @param service: the service we're running a query on
  * @return true if this service can get the unread count from atom
  */
  canFetchUnreadCountFromAtom (service) {
    return !this.isUsingCustomSyncConfig(service) && !!this.mailAtomQueryForService(service)
  }

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
        return undefined
    }
  }

  /**
  * @param service: the service we're runninga query on
  * @return the query to run on the google servers for the unread counts
  */
  mailQueryForService (service) {
    if (service.hasCustomUnreadQuery) { return service.customUnreadQuery }
    switch (service.inboxType) {
      case CoreGoogleMailService.INBOX_TYPES.GMAIL__ALL:
        return 'label:inbox'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD_ATOM:
        return 'label:inbox label:unread'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT_ATOM:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED_ATOM:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY_ATOM:
        return 'label:inbox label:unread is:important'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT:
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT_ATOM:
        return 'label:inbox label:unread category:primary'
      case CoreGoogleMailService.INBOX_TYPES.GINBOX_UNBUNDLED:
        return 'label:inbox label:unread -has:userlabels -category:promotions -category:forums -category:social' // Removed: -category:updates
      default:
        return 'label:inbox'
    }
  }

  /**
  * Checks to see if we're using a custom sync config
  */
  isUsingCustomSyncConfig (service) {
    return service.hasCustomUnreadQuery || service.hasCustomUnreadLabelWatch
  }

  handleSyncServiceMessages ({ serviceId, forceSync }) {
    if (userStore.getState().wireConfigSimpleGoogleAuth()) {
      this.preventDefault()
      if (forceSync) { // ForceSync normally comes from a user-action or store based changed (e.g. right-click resync, inboxType change)
        this._runOnDemandSimpleSync(serviceId)
      }
      return
    }

    // Check we're not already open
    if (this.hasOpenRequest(REQUEST_TYPES.MAIL, serviceId)) {
      this.preventDefault()
      return
    }

    // Get the service and check we have everything
    const accountState = accountStore.getState()
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)
    const serviceAuth = accountState.getMailboxAuthForServiceId(serviceId)

    if (!service || !serviceData || !serviceAuth) {
      this.preventDefault()
      return
    }

    // Log some info if the user is using custom config
    if (this.isUsingCustomSyncConfig(service)) {
      let error
      if (!service.hasCustomUnreadQuery || !service.hasCustomUnreadLabelWatch || (service.customUnreadCountFromLabel && !service.customUnreadCountLabel)) {
        error = 'Using custom query parameters but not all fields are configured. This is most likely a configuration error'
      }
      console[error ? 'warn' : 'log'](
        `${LOG_PFX}${error || 'Using custom query parameters'}`,
        service.id,
        service.customUnreadQuery,
        service.customUnreadLabelWatchArray,
        service.customUnreadCountFromLabel,
        service.customUnreadCountLabel,
        service.customUnreadCountLabelField
      )
    }

    // Start chatting to Google
    const requestId = this.trackOpenRequest(REQUEST_TYPES.MAIL, serviceId)
    const auth = this.getAPIAuth(serviceAuth)
    const labelIds = this.mailLabelIdsForService(service)
    const queryString = this.mailQueryForService(service)

    const singleLabelId = this.mailLabelForLabelQuery(service)
    const canFetchUnreadFromLabel = this.canFetchUnreadCountFromLabel(service)
    const unreadFieldInLabel = this.mailLabelUnreadCountField(service)
    const atomQuery = this.mailAtomQueryForService(service)
    const canFetchUnreadFromAtom = this.canFetchUnreadCountFromAtom(service)

    Promise.resolve()
      .then(() => {
        // STEP 1 [HISTORY]: Get the history changes
        if (serviceData.hasHistoryId) {
          return GoogleHTTP.fetchGmailHistoryList(auth, serviceData.historyId)
            .then(({ historyId, history }) => ({
              historyId: isNaN(parseInt(historyId)) ? undefined : parseInt(historyId),
              hasContentChanged: forceSync || this.hasMailUnreadChangedFromHistory(labelIds, history || [])
            }))
            .catch((err) => {
              // It's rare, but there's a bug with the API which means Google
              // can return a 404 for some history ids. This can shouldn't happen
              // so capture that and instead run a second profile request and assume
              // our history request is wrong
              if (err.message.indexOf('Not Found') !== -1) {
                // Handle the bug mentioned above
                return GoogleHTTP.fetchGmailProfile(auth)
                  .then(({ historyId }) => ({
                    historyId: isNaN(parseInt(historyId)) ? undefined : parseInt(historyId),
                    hasContentChanged: true
                  }))
              } else {
                return Promise.reject(err)
              }
            })
        } else {
          return GoogleHTTP.fetchGmailProfile(auth)
            .then(({ historyId }) => ({
              historyId: isNaN(parseInt(historyId)) ? undefined : parseInt(historyId),
              hasContentChanged: true
            }))
        }
      })
      .then((data) => {
        // STEP 2.1 [UNREAD]: Re-query gmail for the latest unread messages
        if (!data.hasContentChanged) { return data }
        return Promise.resolve()
          .then(() => {
            switch (service.type) {
              case SERVICE_TYPES.GOOGLE_MAIL:
                return GoogleHTTP.fetchGmailThreadHeadersList(auth, queryString, undefined, 10)
              case SERVICE_TYPES.GOOGLE_INBOX:
                return GoogleHTTP.fetchGmailThreadHeadersList(auth, queryString, undefined, 10)
              default:
                return Promise.reject(new Error('Unknown Access Mode'))
            }
          })
          .then(({ resultSizeEstimate, threads = [] }) => {
            return GoogleHTTP
              .fullyResolveGmailThreadHeaders(auth, serviceData.unreadThreadsIndexed, threads, this.trimMailThread)
              .then((fullThreads) => ({
                ...data,
                unreadCount: resultSizeEstimate,
                unreadThreadHeaders: threads,
                unreadThreads: fullThreads
              }))
          })
      })
      .then((data) => {
        // STEP 2.2 [UNREAD/2]: Some unread counts are more accurate when using the count in the label. If we can use this
        if (!data.hasContentChanged) { return data }

        if (canFetchUnreadFromAtom) {
          return Promise.resolve()
            .then(() => GoogleHTTP.fetchGmailAtomUnreadCount(service.partitionId, atomQuery))
            .then((count) => ({ ...data, unreadCount: count }))
        } else if (canFetchUnreadFromLabel) {
          return Promise.resolve()
            .then(() => GoogleHTTP.fetchGmailLabel(auth, singleLabelId))
            .then((response) => {
              if (response[unreadFieldInLabel] !== undefined) {
                return { ...data, unreadCount: response[unreadFieldInLabel] }
              } else {
                return data
              }
            })
        } else {
          return data
        }
      })
      .then((data) => {
        // STEP 3 [STORE]: Update the service service with the new data
        if (data.hasContentChanged) {
          if (Debug.flags.googleLogUnreadMessages) {
            console.log(`[GOOGLE:UNREAD]: ${serviceId}`, [
              '',
              `HistoryId=${data.historyId}`,
              `UnreadCount=${data.unreadCount}`,
              `Threads:`
            ].concat(data.unreadThreads.map((t, i) => `${i}:  ${JSON.stringify(t)}\n`)).join('\n'))
          }

          accountActions.reduceServiceData.defer(
            serviceId,
            CoreGoogleMailServiceDataReducer.updateUnreadInfo,
            data.historyId,
            data.unreadCount,
            data.unreadThreads
          )
        } else {
          accountActions.reduceServiceData.defer(
            serviceId,
            CoreGoogleMailServiceDataReducer.setHistoryId,
            data.historyId
          )
        }
        return data
      })
      .then(() => {
        this.trackCloseRequest(REQUEST_TYPES.MAIL, serviceId, requestId)
        accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeValid)
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
