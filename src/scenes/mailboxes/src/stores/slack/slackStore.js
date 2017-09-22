import alt from '../alt'
import actions from './slackActions'
import SlackMailbox from 'shared/Models/Accounts/Slack/SlackMailbox'
import SlackDefaultService from 'shared/Models/Accounts/Slack/SlackDefaultService'
import SlackHTTP from './SlackHTTP'
import uuid from 'uuid'
import { NotificationService } from 'Notifications'
import {
  SLACK_FULL_COUNT_SYNC_INTERVAL,
  SLACK_RECONNECT_SOCKET_INTERVAL,
  SLACK_RTM_RETRY_RECONNECT_MS
} from 'shared/constants'
import Debug from 'Debug'
import {
  mailboxStore,
  mailboxActions,
  mailboxDispatch,
  SlackMailboxReducer,
  SlackDefaultServiceReducer
} from '../mailbox'
import { remote } from 'electron'

const MAX_NOTIFICATION_RECORD_AGE = 1000 * 60 * 10 // 10 mins
const HTML5_NOTIFICATION_DELAY = 1000 * 2 // 2 secs
const REQUEST_TYPES = {
  UNREAD: 'UNREAD'
}

class SlackStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.connections = new Map()
    this.openRequests = new Map()
    this.publishedNotifications = []

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
    // Connections
    /* **************************************/

    /**
    * Checks if there is a valid connection
    * @param mailboxId: the id of the mailbox
    * @param connectionId: the id of the connection
    * @return true if the mailbox id and connection id match the record
    */
    this.isValidConnection = (mailboxId, connectionId) => {
      return (this.connections.get(mailboxId) || {}).connectionId === connectionId
    }

    /**
    * @return a list of all connections
    */
    this.allConnections = () => {
      const connectionList = []
      this.connections.forEach((connection) => connectionList.push(connection))
      return connectionList
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return true if the mailbox is connection is setup, false otherwise
    */
    this.isMailboxConnectionSetup = (mailboxId) => {
      const info = this.connections.get(mailboxId)
      return !!(info && info.rtm)
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return true if the mailbox is connected, false otherwise
    */
    this.isMailboxConnected = (mailboxId) => {
      const info = this.connections.get(mailboxId)
      return !!(info && info.rtm && info.rtm.isConnected)
    }

    /* **************************************/
    // Listeners
    /* **************************************/

    this.bindListeners({
      handleConnectAllMailboxes: actions.CONNECT_ALL_MAILBOXES,
      handleConnectMailbox: actions.CONNECT_MAILBOX,

      handleReconnectMailbox: actions.RECONNECT_MAILBOX,

      handleDisconnectAllMailboxes: actions.DISCONNECT_ALL_MAILBOXES,
      handleDisconnectMailbox: actions.DISCONNECT_MAILBOX,

      handleUpdateUnreadCounts: actions.UPDATE_UNREAD_COUNTS,

      handleScheduleNotification: actions.SCHEDULE_NOTIFICATION,
      handleScheduleHTML5Notification: actions.SCHEDULE_HTML5NOTIFICATION
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
  // Handlers: Connection open
  /* **************************************************************************/

  /**
  * Connects all the mailboxes to the RTM service
  */
  handleConnectAllMailboxes () {
    mailboxStore.getState().getMailboxesOfType(SlackMailbox.type).forEach((mailbox) => {
      actions.connectMailbox.defer(mailbox.id)
    })
    this.preventDefault()
  }

  /**
  * Connects the mailbox to the RTM service
  * @param mailboxId: the id of the mailbox to connect
  */
  handleConnectMailbox ({ mailboxId }) {
    // Do some preflight checks & grab some data
    if (this.connections.has(mailboxId)) {
      this.preventDefault()
      return
    }
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) {
      this.preventDefault()
      return
    }

    const connectionId = uuid.v4()

    // Start the periodic poller
    const fullPoller = setInterval(() => {
      if (!this.isValidConnection(mailboxId, connectionId)) { return }
      actions.updateUnreadCounts.defer(mailboxId, true)
    }, SLACK_FULL_COUNT_SYNC_INTERVAL)
    const reconnectPoller = setInterval(() => {
      if (!this.isValidConnection(mailboxId, connectionId)) { return }
      if (!this.isMailboxConnected(mailboxId)) {
        actions.reconnectMailbox(mailboxId)
      }
    }, SLACK_RECONNECT_SOCKET_INTERVAL)

    // Start up the socket
    this.connections.set(mailboxId, {
      connectionId: connectionId,
      mailboxId: mailboxId,
      rtm: null,
      fullPoller: fullPoller,
      reconnectPoller: reconnectPoller
    })

    SlackHTTP.startRTM(mailbox.authToken)
      .then(({ response, rtm }) => {
        if (!this.isValidConnection(mailboxId, connectionId)) { return }

        // Bind events
        rtm.on('message:error', (data) => {
          if ((data.error || {}).code === 1) { // Socket URL has expired
            console.warn('Reconnecting SlackRTM Socket for `' + mailboxId + '`', data)
            actions.reconnectMailbox(mailboxId)
          }
        })
        rtm.on('message:desktop_notification', (data) => {
          actions.scheduleNotification(mailboxId, data)
        })
        rtm.on('message', (data) => {
          if (Debug.flags.slackLogWSMessages) {
            console.log(`[SLACK:WS_MESSAGE]: ${mailboxId}`, JSON.stringify(data))
          }
        })

        // These events are in-frequent and lazily acted upon. They require the counts to be re-synced
        rtm.on('message:bot_added', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:channel_archive', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:channel_created', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:channel_deleted', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:channel_joined', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:channel_left', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:channel_unarchive', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:group_archive', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:group_close', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:group_joined', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:group_left', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:group_open', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:group_unarchive', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:im_close', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:im_created', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:im_open', (data) => actions.updateUnreadCounts.defer(mailboxId))
        rtm.on('message:pref_change', (data) => {
          if (data.name === 'muted_channels') {
            actions.updateUnreadCounts.defer(mailboxId)
          }
        })

        rtm.on('message:channel_marked', (data) => {
          mailboxActions.reduceService(mailboxId, SlackDefaultService.type, SlackDefaultServiceReducer.rtmChannelMarked, data)
        })
        rtm.on('message:group_marked', (data) => {
          mailboxActions.reduceService(mailboxId, SlackDefaultService.type, SlackDefaultServiceReducer.rtmGroupMarked, data)
        })
        rtm.on('message:mpim_marked', (data) => {
          mailboxActions.reduceService(mailboxId, SlackDefaultService.type, SlackDefaultServiceReducer.rtmMpimMarked, data)
        })
        rtm.on('message:im_marked', (data) => {
          mailboxActions.reduceService(mailboxId, SlackDefaultService.type, SlackDefaultServiceReducer.rtmImMarked, data)
        })
        rtm.on('message:message', (data) => {
          mailboxActions.reduceService(mailboxId, SlackDefaultService.type, SlackDefaultServiceReducer.rtmMessage, data)
        })

        // Save the connection
        this.connections.set(mailboxId, {
          ...this.connections.get(mailboxId) || {},
          connectionId: connectionId,
          mailboxId: mailboxId,
          rtm: rtm
        })

        // Update the mailbox & run further sync actions
        mailboxActions.reduce.defer(
          mailboxId,
          SlackMailboxReducer.setTeamAndSelfOverview,
          response.team,
          response.self
        )
        actions.updateUnreadCounts.defer(mailboxId)

        this.emitChange()
      })
      .catch(() => {
        if (!this.isValidConnection(mailboxId, connectionId)) { return }

        // Retry connection
        setTimeout(() => {
          if (!this.isValidConnection(mailboxId, connectionId)) { return }
          if (this.isMailboxConnected(mailboxId)) { return }
          actions.reconnectMailbox(mailboxId)
        }, SLACK_RTM_RETRY_RECONNECT_MS)
      })
  }

  /* **************************************************************************/
  // Handlers: Reconnection
  /* **************************************************************************/

  /**
  * Reconnects a mailbox
  * @param mailboxId: the id of the mailbox
  */
  handleReconnectMailbox ({ mailboxId }) {
    this.handleDisconnectMailbox({ mailboxId: mailboxId })
    this.handleConnectMailbox({ mailboxId: mailboxId })
  }

  /* **************************************************************************/
  // Handlers: Connection close
  /* **************************************************************************/

  /**
  * Disconnects all mailboxes from the RTM service
  */
  handleDisconnectAllMailboxes () {
    this.allConnections().forEach((connection) => {
      if (connection.rtm) { connection.rtm.close() }
      clearInterval(connection.fullPoller)
      clearInterval(connection.reconnectPoller)
      this.connections.delete(connection.mailboxId)
    })
    const connections = []
    this.connections.forEach((connection) => connections.push(connection))
  }

  /**
  * Disconnects a mailboxes from the RTM service
  * @param mailboxId: the id of the mailbox to disconnect
  */
  handleDisconnectMailbox ({ mailboxId }) {
    const connection = this.connections.get(mailboxId)
    if (connection) {
      if (connection.rtm) { connection.rtm.close() }
      clearInterval(connection.fullPoller)
      clearInterval(connection.reconnectPoller)
      this.connections.delete(connection.mailboxId)
    }
  }

  /* **************************************************************************/
  // Unread counts
  /* **************************************************************************/

  /**
  * Updates the unread count for the mailbox
  * @param mailboxId: the id of the mailbox
  * @param allowMultiple: set to true to relax the limit of concurrent request
  */
  handleUpdateUnreadCounts ({ mailboxId, allowMultiple }) {
    Debug.flagLog('slackLogUnreadCounts', `[SLACK:UNREAD] call ${mailboxId}`)
    if (allowMultiple !== true && this.hasOpenRequest(REQUEST_TYPES.UNREAD, mailboxId)) {
      this.preventDefault()
      return
    }

    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(SlackDefaultService.type) : null
    if (!mailbox || !service) {
      this.preventDefault()
      return
    }

    Debug.flagLog('slackLogUnreadCounts', `[SLACK:UNREAD] start ${mailboxId}`)
    const requestId = this.trackOpenRequest(REQUEST_TYPES.UNREAD, mailboxId)

    Promise.resolve()
      .then(() => SlackHTTP.fetchUnreadInfo(mailbox.authToken))
      .then((response) => {
        mailboxActions.reduceService(
          mailboxId,
          SlackDefaultService.type,
          SlackDefaultServiceReducer.setSlackUnreadInfo,
          response
        )
        this.trackCloseRequest(REQUEST_TYPES.UNREAD, mailboxId, requestId)
        this.emitChange()
        if (Debug.flags.slackLogUnreadCounts) {
          console.log(`[SLACK:UNREAD] success: ${mailboxId}`, JSON.stringify({
            channels: response.channels.map((c) => {
              return {
                name: c.name,
                is_archived: c.is_archived,
                is_muted: c.is_muted,
                is_member: c.is_member,
                mention_count: c.mention_count_display,
                has_unreads: c.has_unreads
              }
            }),
            groups: response.groups.map((g) => {
              return {
                name: g.name,
                is_archived: g.is_archived,
                is_muted: g.is_muted,
                mention_count: g.mention_count_display,
                has_unreads: g.unread_count_display
              }
            }),
            ims: response.ims.map((i) => {
              return {
                name: i.name,
                dm_count: i.dm_count
              }
            })
          }, null, 2))
        }
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.UNREAD, mailboxId, requestId)
        this.emitChange()
        console.error(err)
        Debug.flagLog('slackLogUnreadCounts', [`[SLACK:UNREAD] error: ${mailboxId}`, err])
      })
  }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * Checks to see if the service has published a notification
  * @param slackNotificationId: the id of the notification
  * @param clean=true: false to skip array cleaning
  */
  _hasPublishedNotification (slackNotificationId, clean = true) {
    if (clean) {
      let hasRecord = false
      const now = new Date().getTime()
      this.publishedNotifications = this.publishedNotifications.filter(({ id, time }) => {
        if (slackNotificationId === id) { hasRecord = true }
        return now - time < MAX_NOTIFICATION_RECORD_AGE
      })
      return hasRecord
    } else {
      return !!this.publishedNotifications.find(({id}) => id === slackNotificationId)
    }
  }

  /**
  * Marks a notification as being published
  * @param slackNotificationId: the id of the notification
  */
  _markNotificationPublished (slackNotificationId) {
    this.publishedNotifications.push({ id: slackNotificationId, time: new Date().getTime() })
  }

  /**
  * Checks if the mailbox has its notifications enabled
  * @param mailboxId: the id of the mailbox
  * @param mailboxState=autoget: the mailbox state
  * @return true if notifications are enabled, false otherwise
  */
  _mailboxHasNotificationsEnabled (mailboxId, mailboxState = mailboxStore.getState()) {
    const mailbox = mailboxState.getMailbox(mailboxId)
    if (!mailbox) { return false }
    if (!mailbox.showNotifications) { return false }

    return true
  }

  handleScheduleNotification ({ mailboxId, message }) {
    this.preventDefault() // no change in this store

    const mailboxState = mailboxStore.getState()
    if (!this._mailboxHasNotificationsEnabled(mailboxId, mailboxState)) { return }

    // Figure out if it's been seen before
    const slackNotificationId = message.msg || message.event_ts
    if (this._hasPublishedNotification(slackNotificationId)) { return }
    this._markNotificationPublished(slackNotificationId)

    // Check to see if we're active and in the channel
    if (remote.getCurrentWindow().isFocused()) {
      if (mailboxState.activeMailboxId() === mailboxId) {
        const currentUrl = mailboxDispatch.getCurrentUrl(mailboxId, SlackDefaultService.type) || ''
        if (currentUrl.indexOf(message.channel) !== -1) { return }
        if (message.channel.indexOf('D') === 0) { // Handle DMs differently
          if (currentUrl.indexOf('@' + message.subtitle.toLowerCase()) !== -1) { return }
        }
      }
    }

    NotificationService.processPushedMailboxNotification(mailboxId, {
      title: `${message.title} ${message.subtitle}`,
      body: [{ content: message.content }],
      data: {
        mailboxId: mailboxId,
        serviceType: SlackDefaultService.type,
        channelId: message.channel,
        launchUri: message.launchUri
      }
    })
  }

  handleScheduleHTML5Notification ({ mailboxId, notificationId, notification, clickHandler }) {
    this.preventDefault() // no change in this store
    if (!this._mailboxHasNotificationsEnabled(mailboxId)) { return }

    const slackNotificationId = (((notification || {}).options || {}).tag || '').replace('tag_', '')
    if (this._hasPublishedNotification(slackNotificationId)) { return }

    // We can give much richer information when it comes off the websocket, so hold out to see if that comes
    setTimeout(() => {
      if (this._hasPublishedNotification(slackNotificationId, false)) { return }
      this._markNotificationPublished(slackNotificationId)

      NotificationService.processHandledMailboxNotification(mailboxId, {
        title: notification.title,
        body: (notification.options || {}).body,
        data: {
          mailboxId: mailboxId,
          serviceType: SlackDefaultService.type,
          notificationId: notificationId
        }
      }, (data) => {
        clickHandler(data.notificationId)
      })
    }, this.isMailboxConnected(mailboxId) ? HTML5_NOTIFICATION_DELAY : 0)
  }
}

export default alt.createStore(SlackStore, 'SlackStore')
