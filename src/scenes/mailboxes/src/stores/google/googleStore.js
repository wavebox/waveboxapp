const alt = require('../alt')
const actions = require('./googleActions')
const GoogleHTTP = require('./GoogleHTTP')
const { GOOGLE_PROFILE_SYNC_INTERVAL, GOOGLE_MAILBOX_WATCH_INTERVAL } = require('shared/constants')
const {
  mailboxStore,
  mailboxActions,
  GoogleMailboxReducer,
  GoogleDefaultServiceReducer
} = require('../mailbox')
const { GoogleMailbox, GoogleDefaultService } = require('shared/Models/Accounts/Google')
const uuid = require('uuid')
const ServerVent = require('Server/ServerVent')

const REQUEST_TYPES = {
  PROFILE: 'PROFILE',
  MAIL: 'MAIL'
}

class GoogleStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.profilePoller = null
    this.watchPoller = null
    this.openRequests = new Map()

    /* **************************************/
    // Requests
    /* **************************************/

    /**
    * @param type: the type of request
    * @param mailboxId: the id of the mailbox
    * @return the number of open requests
    */
    this.openRequestCount = (type, mailboxId) => {
      return (this.openRequests.get(`${type}:${mailboxId}`) || []).length
    }

    /**
    * @param type: the type of request
    * @param mailboxId: the id of the mailbox
    * @return true if there are any open requests
    */
    this.hasOpenRequest = (type, mailboxId) => {
      return this.openRequestCount(type, mailboxId) !== 0
    }

    /* **************************************/
    // Listeners
    /* **************************************/

    this.bindListeners({
      handleStartPolling: actions.START_POLLING_UPDATES,
      handleStopPolling: actions.STOP_POLLING_UPDATES,

      handleSyncAllMailboxProfiles: actions.SYNC_ALL_MAILBOX_PROFILES,
      handleSyncMailboxProfile: actions.SYNC_MAILBOX_PROFILE,

      handleConnectMailbox: actions.CONNECT_MAILBOX,
      handleDisconnectMailbox: actions.DISCONNECT_MAILBOX,
      handleRegisterAllMailboxWatches: actions.REGISTER_ALL_MAILBOX_WATCHES,
      handleRegisterMailboxWatch: actions.REGISTER_MAILBOX_WATCH,

      handleMailHistoryIdChanged: actions.MAIL_HISTORY_ID_CHANGED,
      handleMailHistoryIdChangedFromWatch: actions.MAIL_HISTORY_ID_CHANGED_FROM_WATCH
    })
  }

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  /**
  * Sets up the auth for a mailbox
  * @param mailboxOrMailboxId: the mailbox to get the authentication for or the mailboxId if you want to autofetch the mailbox
  * @return the auth object
  */
  getAPIAuth (mailboxOrMailboxId) {
    const mailbox = typeof (mailboxOrMailboxId) === 'string' ? mailboxStore.getState().getMailbox(mailboxOrMailboxId) : mailboxOrMailboxId
    if (!mailbox) { return undefined }

    return GoogleHTTP.generateAuth(mailbox.accessToken, mailbox.refreshToken, mailbox.authExpiryTime)
  }

  /* **************************************************************************/
  // Requests
  /* **************************************************************************/

  /**
  * Tracks that a request has been opened
  * @param type: the type of request
  * @param mailboxId: the id of the mailbox
  * @param requestId=auto: the unique id for this request
  * @return the requestId
  */
  trackOpenRequest (type, mailboxId, requestId = uuid.v4()) {
    const key = `${type}:${mailboxId}`
    const requestIds = (this.openRequests.get(key) || [])
    const updatedRequestIds = requestIds.filter((id) => id !== requestId).concat(requestId)
    this.openRequests.set(key, updatedRequestIds)
    return requestId
  }

  /**
  * Tracks that a request has been closed
  * @param type: the type of request
  * @param mailboxId: the id of the mailbox
  * @param requestId: the unique id for this request
  * @return the requestId
  */
  trackCloseRequest (type, mailboxId, requestId) {
    const key = `${type}:${mailboxId}`
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
      if (err.message.indexOf('invalid_grant') !== -1 || err.message.indexOf('Invalid Credentials') !== -1) {
        return true
      }
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
  handleStartPolling ({profiles, unread, notification}) {
    // Pollers
    clearInterval(this.profilePoller)
    this.profilePoller = setInterval(() => {
      actions.syncAllMailboxProfiles.defer()
    }, GOOGLE_PROFILE_SYNC_INTERVAL)
    actions.syncAllMailboxProfiles.defer()

    clearInterval(this.watchPoller)
    this.watchPoller = setInterval(() => {
      actions.registerAllMailboxWatches.defer()
    }, GOOGLE_MAILBOX_WATCH_INTERVAL)
    actions.registerAllMailboxWatches.defer()
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

  handleSyncAllMailboxProfiles () {
    mailboxStore.getState().getMailboxesOfType(GoogleMailbox.type).forEach((mailbox) => {
      actions.syncMailboxProfile.defer(mailbox.id)
    })
    this.preventDefault()
  }

  handleSyncMailboxProfile ({ mailboxId }) {
    if (this.hasOpenRequest(REQUEST_TYPES.PROFILE, mailboxId)) {
      this.preventDefault()
      return
    }

    const requestId = this.trackOpenRequest(REQUEST_TYPES.PROFILE, mailboxId)
    const auth = this.getAPIAuth(mailboxId)
    GoogleHTTP.fetchAccountProfile(auth)
      .then((response) => {
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, mailboxId, requestId)
        const email = (response.emails.find((a) => a.type === 'account') || {}).value
        const avatar = response.image.url
        mailboxActions.reduce.defer(mailboxId, GoogleMailboxReducer.revalidateAuth)
        mailboxActions.reduce.defer(mailboxId, GoogleMailboxReducer.setProfileInfo, email, avatar)
        this.emitChange()
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, mailboxId, requestId)
        if (this.isInvalidGrantError(err)) {
          mailboxActions.reduce.defer(mailboxId, GoogleMailboxReducer.invalidateAuth)
        } else {
          console.error(err)
        }
        this.emitChange()
      })
  }

  /* **************************************************************************/
  // Handlers: Push server
  /* **************************************************************************/

  handleConnectMailbox ({ mailboxId }) {
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    ServerVent.startListeningForGooglePushUpdates(mailboxId, mailbox.authEmail, mailbox.authPushToken)
    this.preventDefault()
  }

  handleDisconnectMailbox ({ mailboxId }) {
    ServerVent.stopListeningForGooglePushUpdates(mailboxId)
    this.preventDefault()
  }

  handleRegisterAllMailboxWatches () {
    mailboxStore.getState().getMailboxesOfType(GoogleMailbox.type).forEach((mailbox) => {
      actions.registerMailboxWatch.defer(mailbox.id)
    })
    this.preventDefault()
  }

  handleRegisterMailboxWatch ({ mailboxId }) {
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) {
      this.preventDefault()
      return
    }

    const auth = this.getAPIAuth(mailbox)
    Promise.resolve()
      .then(() => GoogleHTTP.watchAccount(auth))
      .then(() => {
        mailboxActions.reduce.defer(mailboxId, GoogleMailboxReducer.revalidateAuth)
      })
      .catch((err) => {
        if (this.isInvalidGrantError(err)) {
          mailboxActions.reduce.defer(mailboxId, GoogleMailboxReducer.invalidateAuth)
        } else {
          console.error(err)
        }
      })
  }

  /* **************************************************************************/
  // Handlers: Mail
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
    switch (service.unreadMode) {
      case GoogleDefaultService.UNREAD_MODES.INBOX_ALL:
        return ['INBOX']
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD:
        return ['INBOX', 'UNREAD']
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT:
        return ['INBOX', 'UNREAD', 'IMPORTANT']
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL:
        return ['INBOX', 'UNREAD', 'CATEGORY_PERSONAL']
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED: // default
      default:
        return ['INBOX']
    }
  }

  /**
  * @param service: the service we're runninga query on
  * @return the query to run on the google servers for the unread counts
  */
  mailQueryForService (service) {
    switch (service.unreadMode) {
      case GoogleDefaultService.UNREAD_MODES.INBOX_ALL:
        return 'label:inbox'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD:
        return 'label:inbox label:unread'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT:
        return 'label:inbox label:unread is:important'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL:
        return 'label:inbox label:unread category:important'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED:
        return 'label:inbox label:unread -has:userlabels -category:promotions -category:forums -category:social' // Removed: -category:updates
      default:
        return 'label:inbox'
    }
  }

  handleMailHistoryIdChanged ({ mailboxId, forceSync }) {
    if (this.hasOpenRequest(REQUEST_TYPES.MAIL, mailboxId)) {
      this.preventDefault()
      return
    }

    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(GoogleDefaultService.type) : null
    if (!mailbox || !service) {
      this.preventDefault()
      return
    }

    const requestId = this.trackOpenRequest(REQUEST_TYPES.MAIL, mailboxId)
    const auth = this.getAPIAuth(mailbox)
    const labelIds = this.mailLabelIdsForService(service)
    const queryString = this.mailQueryForService(service)
    Promise.resolve()
      .then(() => {
        // STEP 1 [HISTORY]: Get the history changes
        if (service.hasHistoryId) {
          return GoogleHTTP.fetchGmailHistoryList(auth, service.historyId)
            .then(({ historyId, history }) => {
              return {
                historyId: historyId,
                hasContentChanged: forceSync || this.hasMailUnreadChangedFromHistory(labelIds, history || [])
              }
            })
        } else {
          return GoogleHTTP.fetchGmailProfile(auth)
            .then(({ historyId }) => {
              return {
                historyId: historyId,
                hasContentChanged: true
              }
            })
        }
      })
      .then((data) => {
        // STEP 2 [UNREAD]: Re-query gmail for the latest unread messages
        if (!data.hasContentChanged) { return data }

        return Promise.resolve()
          .then(() => {
            switch (service.accessMode) {
              case GoogleDefaultService.ACCESS_MODES.GMAIL:
                return GoogleHTTP.fetchGmailThreadHeadersList(auth, queryString, undefined, 10)
              case GoogleDefaultService.ACCESS_MODES.GINBOX:
                return GoogleHTTP.fetchGmailThreadHeadersList(auth, queryString, undefined, 10)
              default:
                return Promise.reject(new Error('Unknown Access Mode'))
            }
          })
          .then(({resultSizeEstimate, threads = []}) => {
            return GoogleHTTP
              .fullyResolveGmailThreadHeaders(auth, service.unreadThreadsIndexed, threads, this.trimMailThread)
              .then((fullThreads) => {
                return Object.assign({}, data, {
                  unreadCount: resultSizeEstimate,
                  unreadThreadHeaders: threads,
                  unreadThreads: fullThreads
                })
              })
          })
      })
      .then((data) => {
        // STEP 3 [STORE]: Update the mailbox service with the new data
        if (data.hasContentChanged) {
          mailboxActions.reduceService.defer(
            mailbox.id,
            GoogleDefaultService.type,
            GoogleDefaultServiceReducer.updateUnreadInfo,
            data.historyId,
            data.unreadCount,
            data.unreadThreads
          )
        } else {
          mailboxActions.reduceService.defer(
            mailbox.id,
            GoogleDefaultService.type,
            GoogleDefaultServiceReducer.setHistoryId,
            data.historyId
          )
        }
        return data
      })
      .then(() => {
        this.trackCloseRequest(REQUEST_TYPES.MAIL, mailboxId, requestId)
        mailboxActions.reduce.defer(mailboxId, GoogleMailboxReducer.revalidateAuth)
        this.emitChange()
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.MAIL, mailboxId, requestId)
        if (this.isInvalidGrantError(err)) {
          mailboxActions.reduce.defer(mailboxId, GoogleMailboxReducer.invalidateAuth)
        } else {
          console.error(err)
        }
        this.emitChange()
      })
  }

  handleMailHistoryIdChangedFromWatch ({ email }) {
    mailboxStore.getState().getMailboxesOfType(GoogleMailbox.type).forEach((mailbox) => {
      if (mailbox.authEmail === email) {
        actions.mailHistoryIdChanged.defer(mailbox.id)
      }
    })
    this.preventDefault()
  }
}

module.exports = alt.createStore(GoogleStore, 'GoogleStore')
