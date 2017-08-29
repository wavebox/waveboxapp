import alt from '../alt'
import actions from './trelloActions'
import { TRELLO_PROFILE_SYNC_INTERVAL, TRELLO_NOTIFICATION_SYNC_INTERVAL } from 'shared/constants'
import { TrelloMailbox } from 'shared/Models/Accounts/Trello'
import TrelloHTTP from './TrelloHTTP'
import uuid from 'uuid'
import Debug from 'Debug'
import {
  mailboxStore,
  mailboxActions,
  TrelloMailboxReducer,
  TrelloDefaultServiceReducer
} from '../mailbox'

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
      handleStartPollSync: actions.START_POLLING_UPDATES,
      handleStopPollSync: actions.STOP_POLLING_UPDATES,

      handleSyncAllMailboxProfiles: actions.SYNC_ALL_MAILBOX_PROFILES,
      handleSyncMailboxProfile: actions.SYNC_MAILBOX_PROFILE,

      handleSyncAllMailboxNotifications: actions.SYNC_ALL_MAILBOX_NOTIFICATIONS,
      handleSyncMailboxNotifications: actions.SYNC_MAILBOX_NOTIFICATIONS,
      handleSyncMailboxNotificationsAfter: actions.SYNC_MAILBOX_NOTIFICATIONS_AFTER
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
      actions.syncAllMailboxProfiles.defer()
    }, TRELLO_PROFILE_SYNC_INTERVAL)
    actions.syncAllMailboxProfiles.defer()

    clearInterval(this.notificationPoller)
    this.notificationPoller = setInterval(() => {
      actions.syncAllMailboxNotifications.defer()
    }, TRELLO_NOTIFICATION_SYNC_INTERVAL)
    actions.syncAllMailboxNotifications.defer()
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

  handleSyncAllMailboxProfiles () {
    mailboxStore.getState().getMailboxesOfType(TrelloMailbox.type).forEach((mailbox) => {
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
      .then(() => TrelloHTTP.fetchAccountProfile(mailbox.authAppKey, mailbox.authToken))
      .then((response) => {
        mailboxActions.reduce.defer(
          mailboxId,
          TrelloMailboxReducer.setProfileInfo,
          response.username,
          response.email,
          response.fullName,
          response.initials,
          { avatarSource: response.avatarSource, avatarHash: response.avatarHash }
        )
        return Promise.resolve()
      })
      .then(() => TrelloHTTP.fetchBoards(mailbox.authAppKey, mailbox.authToken, ['id', 'name', 'shortUrl'], 'open'))
      .then((response) => {
        mailboxActions.reduceService.defer(
          mailboxId,
          TrelloMailbox.SERVICE_TYPES.DEFAULT,
          TrelloDefaultServiceReducer.setBoards,
          response
        )
        return Promise.resolve()
      })
      .then(() => {
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
  // Handlers: Notifications
  /* **************************************************************************/

  handleSyncAllMailboxNotifications () {
    mailboxStore.getState().getMailboxesOfType(TrelloMailbox.type).forEach((mailbox) => {
      actions.syncMailboxNotifications.defer(mailbox.id)
    })
    this.preventDefault()
  }

  handleSyncMailboxNotifications ({ mailboxId }) {
    Debug.flagLog('trelloLogUnreadCounts', `[TRELLO:UNREAD] call ${mailboxId}`)
    if (this.hasOpenRequest(REQUEST_TYPES.NOTIFICATION, mailboxId)) {
      this.preventDefault()
      return
    }
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) {
      this.preventDefault()
      return
    }

    Debug.flagLog('trelloLogUnreadCounts', `[TRELLO:UNREAD] start ${mailboxId}`)
    const requestId = this.trackOpenRequest(REQUEST_TYPES.NOTIFICATION, mailboxId)
    TrelloHTTP.fetchUnreadNotifications(mailbox.authAppKey, mailbox.authToken)
      .then((notifications) => {
        this.trackCloseRequest(REQUEST_TYPES.NOTIFICATION, mailboxId, requestId)
        mailboxActions.reduceService.defer(
          mailboxId,
          TrelloMailbox.SERVICE_TYPES.DEFAULT,
          TrelloDefaultServiceReducer.setUnreadNotifications,
          notifications || []
        )
        this.emitChange()
        if (Debug.flags.trelloLogUnreadCounts) {
          console.log(`[TRELLO:UNREAD] success: ${mailboxId}`, JSON.stringify(notifications, null, 2))
        }
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.NOTIFICATION, mailboxId, requestId)
        console.error(err)
        this.emitChange()
        Debug.flagLog('trelloLogUnreadCounts', [`[TRELLO:UNREAD] error: ${mailboxId}`, err])
      })
  }

  handleSyncMailboxNotificationsAfter ({ mailboxId, wait }) {
    setTimeout(() => {
      actions.syncMailboxNotifications.defer(mailboxId)
    }, wait)
    this.preventDefault()
  }
}

export default alt.createStore(TrelloStore, 'TrelloStore')
