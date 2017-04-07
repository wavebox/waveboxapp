const alt = require('../alt')
const actions = require('./slackActions')
const {
  mailboxStore,
  mailboxActions,
  mailboxDispatch,
  SlackMailboxReducer,
  SlackDefaultServiceReducer
} = require('../mailbox')
const SlackMailbox = require('shared/Models/Accounts/Slack/SlackMailbox')
const SlackDefaultService = require('shared/Models/Accounts/Slack/SlackDefaultService')
const SlackHTTP = require('./SlackHTTP')
const uuid = require('uuid')
const NotificationService = require('../../Notifications/NotificationService')
const { SLACK_FULL_COUNT_SYNC_INTERVAL } = require('shared/constants')

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

    /* **************************************/
    // Listeners
    /* **************************************/

    this.bindListeners({
      handleConnectAllMailboxes: actions.CONNECT_ALL_MAILBOXES,
      handleConnectMailbox: actions.CONNECT_MAILBOX,

      handleDisconnectAllMailboxes: actions.DISCONNECT_ALL_MAILBOXES,
      handleDisconnectMailbox: actions.DISCONNECT_MAILBOX,

      handleUpdateUnreadCounts: actions.UPDATE_UNREAD_COUNTS,

      handleScheduleNotification: actions.SCHEDULE_NOTIFICATION
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

    // Start the periodic poller
    const fullPoller = setInterval(() => {
      actions.updateUnreadCounts.defer(mailboxId, true)
    }, SLACK_FULL_COUNT_SYNC_INTERVAL)

    // Start up the socket
    const connectionId = uuid.v4()
    this.connections.set(mailboxId, {
      connectionId: connectionId,
      mailboxId: mailboxId,
      rtm: null,
      fullPoller: fullPoller
    })

    SlackHTTP.startRTM(mailbox.authToken)
      .then(({ response, rtm }) => {
        if (!this.isValidConnection(mailboxId, connectionId)) { return }

        // Bind events
        rtm.on('message:error', (data) => {
          if ((data.error || {}).code === 1) { // Socket URL has expired
            console.warn('Reconnecting SlackRTM Socket for `' + mailboxId + '`', data)
            actions.disconnectMailbox.defer(mailboxId)
            actions.connectMailbox.defer(mailboxId)
          }
        })
        rtm.on('message:desktop_notification', (data) => {
          actions.scheduleNotification(mailboxId, data)
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

        rtm.on('message:channel_marked', (data) => {
          mailboxActions.reduceService(mailboxId, SlackDefaultService.type, SlackDefaultServiceReducer.rtmChannelMarked, data)
        })
        rtm.on('message:group_marked', (data) => {
          mailboxActions.reduceService(mailboxId, SlackDefaultService.type, SlackDefaultServiceReducer.rtmGroupMarked, data)
        })
        rtm.on('message:im_marked', (data) => {
          mailboxActions.reduceService(mailboxId, SlackDefaultService.type, SlackDefaultServiceReducer.rtmImMarked, data)
        })
        rtm.on('message:message', (data) => {
          mailboxActions.reduceService(mailboxId, SlackDefaultService.type, SlackDefaultServiceReducer.rtmMessage, data)
        })

        // Save the connection
        this.connections.set(mailboxId, {
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
        actions.updateUnreadCounts.defer(mailboxId, true)

        this.emitChange()
      })
      .catch((err) => {
        if (!this.isValidConnection(mailboxId, connectionId)) { return }
        this.connections.delete(mailboxId)
        this.emitChange()
        console.error('[RTM Error]', err)
      })
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
      })
      .catch((err) => {
        this.trackCloseRequest(REQUEST_TYPES.UNREAD, mailboxId, requestId)
        this.emitChange()
        console.error(err)
      })
  }

  handleScheduleNotification ({ mailboxId, message }) {
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) { return }
    if (!mailbox.showNotifications) { return }

    // Check to see if we're in the channel
    const currentUrl = mailboxDispatch.getCurrentUrl(mailboxId, SlackDefaultService.type) || ''
    if (currentUrl.indexOf(message.channel) !== -1) { return }
    if (message.channel.indexOf('D') === 0) { // Handle DMs differently
      if (currentUrl.indexOf('@' + message.subtitle.toLowerCase()) !== -1) { return }
    }

    NotificationService.showNotification({
      title: `${message.title} ${message.subtitle}`,
      body: [{ content: message.content }],
      data: {
        mailboxId: mailboxId,
        serviceType: SlackDefaultService.type,
        channelId: message.channel
      }
    })
  }
}

module.exports = alt.createStore(SlackStore, 'SlackStore')
