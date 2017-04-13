const alt = require('../alt')
const actions = require('./microsoftActions')
const MicrosoftHTTP = require('./MicrosoftHTTP')
const { MICROSOFT_PROFILE_SYNC_INTERVAL, MICROSOFT_UNREAD_SYNC_INTERVAL } = require('shared/constants')
const {
  mailboxStore,
  mailboxActions,
  MicrosoftMailboxReducer,
  MicrosoftDefaultServiceReducer,
  MicrosoftStorageServiceReducer
} = require('../mailbox')
const {
  MicrosoftMailbox,
  MicrosoftDefaultService,
  MicrosoftStorageService
} = require('shared/Models/Accounts/Microsoft')
const uuid = require('uuid')

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

      handleSyncAllMailboxMail: actions.SYNC_ALL_MAILBOX_MAIL,
      handleSyncMailboxMail: actions.SYNC_MAILBOX_MAIL,
      handleSyncMailboxMailAfter: actions.SYNC_MAILBOX_MAIL_AFTER
    })
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
  // Auth Utils
  /* **************************************************************************/

  /**
  * Gets the api authentication
  * @param mailboxIdOrMailbox: the mailbox or the mailbox id
  * @return promise, provided with the access token
  */
  getAPIAuth (mailboxIdOrMailbox) {
    const mailbox = typeof (mailboxIdOrMailbox) === 'string' ? mailboxStore.getState().getMailbox(mailboxIdOrMailbox) : mailboxIdOrMailbox

    if (!mailbox) { return Promise.reject(new Error('No mailbox')) }
    if (mailbox.authExpiryTime > new Date().getTime()) {
      return Promise.resolve(mailbox.accessToken)
    } else {
      return Promise.resolve()
        .then(() => MicrosoftHTTP.refreshAuthToken(mailbox.refreshToken))
        .then((auth) => {
          mailboxActions.reduce.defer(mailbox.id, MicrosoftMailboxReducer.setAuthInfo, auth)
          return Promise.resolve(auth.access_token)
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
      actions.syncAllMailboxProfiles.defer()
    }, MICROSOFT_PROFILE_SYNC_INTERVAL)
    actions.syncAllMailboxProfiles.defer()

    clearInterval(this.mailPoller)
    this.mailPoller = setInterval(() => {
      actions.syncAllMailboxMail.defer()
    }, MICROSOFT_UNREAD_SYNC_INTERVAL)
    actions.syncAllMailboxMail.defer()
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

  handleSyncAllMailboxProfiles () {
    mailboxStore.getState().getMailboxesOfType(MicrosoftMailbox.type).forEach((mailbox) => {
      actions.syncMailboxProfile.defer(mailbox.id)
    })
    this.preventDefault()
  }

  handleSyncMailboxProfile ({ mailboxId }) {
    if (this.hasOpenRequest(REQUEST_TYPES.PROFILE, mailboxId)) {
      this.preventDefault()
      return
    }

    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) {
      this.preventDefault()
      return
    }

    const requestId = this.trackOpenRequest(REQUEST_TYPES.PROFILE, mailboxId)
    Promise.resolve()
      .then(() => this.getAPIAuth(mailbox))
      .then((accessToken) => { // STEP 1: Sync profile
        return Promise.resolve()
          .then(() => MicrosoftHTTP.fetchAccountProfile(accessToken))
          .then((profile) => {
            mailboxActions.reduce.defer(
              mailboxId,
              MicrosoftMailboxReducer.setProfileInfo,
              profile.id,
              profile.userPrincipalName,
              profile.displayName
            )
            return accessToken
          })
      })
      .then((accessToken) => { // Step 2: Sync drive info
        if (mailbox.accessMode === mailbox.ACCESS_MODES.OFFICE365) {
          return Promise.resolve()
            .then(() => MicrosoftHTTP.fetchOffice365DriveUrl(accessToken))
            .then((driveUrl) => {
              mailboxActions.reduceService.defer(
                mailboxId,
                MicrosoftStorageService.type,
                MicrosoftStorageServiceReducer.setDriveUrl,
                driveUrl
              )
              return accessToken
            })
        } else {
          return Promise.resolve(accessToken)
        }
      })
      .then((accessToken) => { // Step 3: Sync avatar info
        if (mailbox.accessMode === mailbox.ACCESS_MODES.OFFICE365) {
          return Promise.resolve()
            .then(() => MicrosoftHTTP.fetchOffice365Avatar(accessToken))
            .then((b64Image) => {
              mailboxActions.setServiceLocalAvatar.defer(mailbox.id, b64Image)
              return accessToken
            })
        } else {
          return Promise.resolve(accessToken)
        }
      })
      .then(() => { // Finish-up
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, mailboxId, requestId)
        this.emitChange()
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.PROFILE, mailboxId, requestId)
        console.error(err)
        this.emitChange()
      })
  }

  /* **************************************************************************/
  // Handlers: Messages
  /* **************************************************************************/

  handleSyncAllMailboxMail () {
    mailboxStore.getState().getMailboxesOfType(MicrosoftMailbox.type).forEach((mailbox) => {
      actions.syncMailboxMail.defer(mailbox.id)
    })
    this.preventDefault()
  }

  handleSyncMailboxMail ({ mailboxId }) {
    if (this.hasOpenRequest(REQUEST_TYPES.MAIL, mailboxId)) {
      this.preventDefault()
      return
    }
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) {
      this.preventDefault()
      return
    }

    const requestId = this.trackOpenRequest(REQUEST_TYPES.MAIL, mailboxId)
    Promise.resolve()
      .then(() => this.getAPIAuth(mailbox))
      .then((accessToken) => MicrosoftHTTP.fetchUnreadMessages(accessToken))
      .then((response) => {
        this.trackCloseRequest(REQUEST_TYPES.MAIL, mailboxId, requestId)
        mailboxActions.reduceService(
          mailboxId,
          MicrosoftDefaultService.type,
          MicrosoftDefaultServiceReducer.setUnreadInfo,
          response.value
        )
        this.emitChange()
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.NOTIFICATION, mailboxId, requestId)
        console.error(err)
        this.emitChange()
      })
  }

  handleSyncMailboxMailAfter ({ mailboxId, wait }) {
    setTimeout(() => {
      actions.syncMailboxMail.defer(mailboxId)
    }, wait)
    this.preventDefault()
  }
}

module.exports = alt.createStore(MicrosoftStore, 'MicrosoftStore')
