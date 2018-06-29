import alt from '../alt'
import actions from './slackActions'
import SlackHTTP from './SlackHTTP'
import uuid from 'uuid'
import { NotificationService } from 'Notifications'
import {
  SLACK_FULL_COUNT_SYNC_INTERVAL,
  SLACK_RECONNECT_SOCKET_INTERVAL,
  SLACK_RTM_RETRY_RECONNECT_MS
} from 'shared/constants'
import Debug from 'Debug'
import { remote } from 'electron'
import emoji from 'node-emoji'
import { accountStore, accountActions, accountDispatch } from '../account'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import AuthReducer from 'shared/AltStores/Account/AuthReducers/AuthReducer'
import SlackServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/SlackServiceDataReducer'
import SlackServiceReducer from 'shared/AltStores/Account/ServiceReducers/SlackServiceReducer'

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
    // Connections
    /* **************************************/

    /**
    * Checks if there is a valid connection
    * @param serviceId: the id of the service
    * @param connectionId: the id of the connection
    * @return true if the service id and connection id match the record
    */
    this.isValidConnection = (serviceId, connectionId) => {
      return (this.connections.get(serviceId) || {}).connectionId === connectionId
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
    * @param serviceId: the id of the service
    * @return true if the service is connection is setup, false otherwise
    */
    this.isServiceConnectionSetup = (serviceId) => {
      const info = this.connections.get(serviceId)
      return !!(info && info.rtm)
    }

    /**
    * @param serviceId: the id of the service
    * @return true if the service is connected, false otherwise
    */
    this.isServiceConnected = (serviceId) => {
      const info = this.connections.get(serviceId)
      return !!(info && info.rtm && info.rtm.isConnected)
    }

    /* **************************************/
    // Listeners
    /* **************************************/

    this.bindListeners({
      handleConnectAllServices: actions.CONNECT_ALL_SERVICES,
      handleConnectService: actions.CONNECT_SERVICE,

      handleReconnectService: actions.RECONNECT_SERVICE,

      handleDisconnectAllServices: actions.DISCONNECT_ALL_SERVICES,
      handleDisconnectService: actions.DISCONNECT_SERVICE,

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
  isInvalidAuthError (err) {
    if (typeof (err) === 'object' && err.error === 'invalid_auth') {
      return true
    }

    return false
  }

  /* **************************************************************************/
  // Handlers: Connection open
  /* **************************************************************************/

  /**
  * Connects all the services to the RTM service
  */
  handleConnectAllServices () {
    this.preventDefault()

    accountStore
      .getState()
      .allServicesOfType(SERVICE_TYPES.SLACK)
      .forEach((service) => {
        actions.connectService.defer(service.id)
      })
  }

  /**
  * Connects the service to the RTM service
  * @param serviceId: the id of the service to connect
  */
  handleConnectService ({ serviceId }) {
    // Do some preflight checks & grab some data
    if (this.connections.has(serviceId)) {
      this.preventDefault()
      return
    }
    const serviceAuth = accountStore.getState().getMailboxAuthForServiceId(serviceId)
    if (!serviceAuth) {
      this.preventDefault()
      return
    }

    const connectionId = uuid.v4()

    // Start the periodic poller
    const fullPoller = setInterval(() => {
      if (!this.isValidConnection(serviceId, connectionId)) { return }
      actions.updateUnreadCounts.defer(serviceId, true)
    }, SLACK_FULL_COUNT_SYNC_INTERVAL)
    const reconnectPoller = setInterval(() => {
      if (!this.isValidConnection(serviceId, connectionId)) { return }
      if (!this.isServiceConnected(serviceId)) {
        actions.reconnectService(serviceId)
      }
    }, SLACK_RECONNECT_SOCKET_INTERVAL)

    // Start up the socket
    this.connections.set(serviceId, {
      connectionId: connectionId,
      serviceId: serviceId,
      rtm: null,
      fullPoller: fullPoller,
      reconnectPoller: reconnectPoller
    })

    Promise.resolve()
      .then(() => SlackHTTP.startRTM(serviceAuth.authToken))
      .then(({ response, rtm }) => {
        if (!this.isValidConnection(serviceId, connectionId)) { return }
        accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeValid)

        // Bind events
        rtm.on('message:error', (data) => {
          if ((data.error || {}).code === 1) { // Socket URL has expired
            console.warn('Reconnecting SlackRTM Socket for `' + serviceId + '`', data)
            actions.reconnectService(serviceId)
          }
        })
        rtm.on('message:desktop_notification', (data) => {
          actions.scheduleNotification(serviceId, data)
        })
        rtm.on('message', (data) => {
          if (Debug.flags.slackLogWSMessages) {
            console.log(`[SLACK:WS_MESSAGE]: ${serviceId}`, JSON.stringify(data))
          }
        })

        // These events are in-frequent and lazily acted upon. They require the counts to be re-synced
        rtm.on('message:bot_added', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:channel_archive', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:channel_created', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:channel_deleted', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:channel_joined', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:channel_left', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:channel_unarchive', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:group_archive', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:group_close', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:group_joined', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:group_left', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:group_open', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:group_unarchive', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:im_close', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:im_created', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:im_open', (data) => actions.updateUnreadCounts(serviceId))
        rtm.on('message:pref_change', (data) => {
          if (data.name === 'muted_channels') {
            actions.updateUnreadCounts(serviceId)
          }
        })

        rtm.on('message:channel_marked', (data) => {
          accountActions.reduceServiceData(
            serviceId,
            SlackServiceDataReducer.rtmChannelMarked,
            data
          )
        })
        rtm.on('message:group_marked', (data) => {
          accountActions.reduceServiceData(
            serviceId,
            SlackServiceDataReducer.rtmGroupMarked,
            data
          )
        })
        rtm.on('message:mpim_marked', (data) => {
          accountActions.reduceServiceData(
            serviceId,
            SlackServiceDataReducer.rtmMpimMarked,
            data
          )
        })
        rtm.on('message:im_marked', (data) => {
          accountActions.reduceServiceData(
            serviceId,
            SlackServiceDataReducer.rtmImMarked,
            data
          )
        })
        rtm.on('message:message', (data) => {
          accountActions.reduceServiceData(
            serviceId,
            SlackServiceDataReducer.rtmMessage,
            data
          )
        })

        // Save the connection
        this.connections.set(serviceId, {
          ...this.connections.get(serviceId) || {},
          connectionId: connectionId,
          serviceId: serviceId,
          rtm: rtm
        })

        // Update the service & run further sync actions
        accountActions.reduceService(
          serviceId,
          SlackServiceReducer.setTeamAndSelfOverview,
          response.team,
          response.self,
          serviceAuth.authUserId
        )
        actions.updateUnreadCounts.defer(serviceId)

        this.emitChange()
      })
      .catch((err) => {
        if (!this.isValidConnection(serviceId, connectionId)) { return }

        if (this.isInvalidAuthError(err)) {
          accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeInvalid)
        } else {
          console.error(err)
        }

        // Retry connection
        setTimeout(() => {
          if (!this.isValidConnection(serviceId, connectionId)) { return }
          if (this.isServiceConnected(serviceId)) { return }
          actions.reconnectService(serviceId)
        }, SLACK_RTM_RETRY_RECONNECT_MS)
      })
  }

  /* **************************************************************************/
  // Handlers: Reconnection
  /* **************************************************************************/

  /**
  * Reconnects a service
  * @param serviceId: the id of the service
  */
  handleReconnectService ({ serviceId }) {
    this.handleDisconnectService({ serviceId: serviceId })
    this.handleConnectService({ serviceId: serviceId })
  }

  /* **************************************************************************/
  // Handlers: Connection close
  /* **************************************************************************/

  /**
  * Disconnects all services from the RTM service
  */
  handleDisconnectAllServices () {
    this.allConnections().forEach((connection) => {
      if (connection.rtm) { connection.rtm.close() }
      clearInterval(connection.fullPoller)
      clearInterval(connection.reconnectPoller)
      this.connections.delete(connection.serviceId)
    })
    const connections = []
    this.connections.forEach((connection) => connections.push(connection))
  }

  /**
  * Disconnects a services from the RTM service
  * @param serviceId: the id of the service to disconnect
  */
  handleDisconnectService ({ serviceId }) {
    const connection = this.connections.get(serviceId)
    if (connection) {
      if (connection.rtm) { connection.rtm.close() }
      clearInterval(connection.fullPoller)
      clearInterval(connection.reconnectPoller)
      this.connections.delete(connection.serviceId)
    }
  }

  /* **************************************************************************/
  // Unread counts
  /* **************************************************************************/

  /**
  * Updates the unread count for the service
  * @param serviceId: the id of the service
  * @param allowMultiple: set to true to relax the limit of concurrent request
  */
  handleUpdateUnreadCounts ({ serviceId, allowMultiple }) {
    Debug.flagLog('slackLogUnreadCounts', `[SLACK:UNREAD] call ${serviceId}`)
    if (allowMultiple !== true && this.hasOpenRequest(REQUEST_TYPES.UNREAD, serviceId)) {
      this.preventDefault()
      return
    }

    const serviceAuth = accountStore.getState().getMailboxAuthForServiceId(serviceId)
    if (!serviceAuth) {
      this.preventDefault()
      return
    }

    Debug.flagLog('slackLogUnreadCounts', `[SLACK:UNREAD] start ${serviceId}`)
    const requestId = this.trackOpenRequest(REQUEST_TYPES.UNREAD, serviceId)

    Promise.resolve()
      .then(() => SlackHTTP.fetchUnreadInfo(serviceAuth.authToken))
      .then((response) => {
        accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeValid)
        accountActions.reduceServiceData(
          serviceId,
          SlackServiceDataReducer.setSlackUnreadInfo,
          response
        )

        this.trackCloseRequest(REQUEST_TYPES.UNREAD, serviceId, requestId)
        this.emitChange()

        if (Debug.flags.slackLogUnreadCounts) {
          console.log(`[SLACK:UNREAD] success: ${serviceId}`, JSON.stringify({
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
        this.trackCloseRequest(REQUEST_TYPES.UNREAD, serviceId, requestId)
        this.emitChange()

        if (this.isInvalidAuthError(err)) {
          accountActions.reduceAuth(serviceAuth.id, AuthReducer.makeInvalid)
        } else {
          console.error(err)
        }

        Debug.flagLog('slackLogUnreadCounts', [`[SLACK:UNREAD] error: ${serviceId}`, err])
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
  * Checks if the service has its notifications enabled
  * @param serviceId: the id of the service
  * @param accountState=autoget: the service state
  * @return true if notifications are enabled, false otherwise
  */
  _serviceHasNotificationsEnabled (serviceId, accountState = accountStore.getState()) {
    const service = accountState.getService(serviceId)
    if (!service) { return false }
    if (!service.showNotifications) { return false }

    return true
  }

  handleScheduleNotification ({ serviceId, message }) {
    this.preventDefault() // no change in this store

    const accountState = accountStore.getState()
    if (!this._serviceHasNotificationsEnabled(serviceId, accountState)) { return }

    // Figure out if it's been seen before
    const slackNotificationId = message.msg || message.event_ts
    if (this._hasPublishedNotification(slackNotificationId)) { return }
    this._markNotificationPublished(slackNotificationId)

    // Check to see if we're active and in the channel
    if (remote.getCurrentWindow().isFocused()) {
      if (accountState.activeServiceId() === serviceId) {
        const currentUrl = accountDispatch.getCurrentUrl(serviceId) || ''
        if (currentUrl.indexOf(message.channel) !== -1) { return }
        if (message.channel.indexOf('D') === 0) { // Handle DMs differently
          if (currentUrl.indexOf('@' + message.subtitle.toLowerCase()) !== -1) { return }
        }
      }
    }

    const mailboxId = (accountState.getService(serviceId) || {}).parentId
    NotificationService.processPushedMailboxNotification(mailboxId, serviceId, {
      title: `${message.title} ${message.subtitle}`,
      body: [{
        content: emoji.emojify(message.content)
      }],
      data: {
        mailboxId: mailboxId,
        serviceId: serviceId,
        channelId: message.channel,
        launchUri: message.launchUri
      }
    })
  }

  handleScheduleHTML5Notification ({ serviceId, notificationId, notification, clickHandler }) {
    this.preventDefault()

    const accountState = accountStore.getState()
    if (!this._serviceHasNotificationsEnabled(serviceId, accountState)) { return }

    const slackNotificationId = (((notification || {}).options || {}).tag || '').replace('tag_', '')
    if (this._hasPublishedNotification(slackNotificationId)) { return }

    // We can give much richer information when it comes off the websocket, so hold out to see if that comes
    setTimeout(() => {
      if (this._hasPublishedNotification(slackNotificationId, false)) { return }
      this._markNotificationPublished(slackNotificationId)

      const mailboxId = (accountState.getService(serviceId) || {}).parentId
      NotificationService.processHandledMailboxNotification(mailboxId, serviceId, {
        title: notification.title,
        body: emoji.emojify((notification.options || {}).body),
        data: {
          mailboxId: mailboxId,
          serviceId: serviceId,
          notificationId: notificationId
        }
      }, (data) => {
        clickHandler(data.notificationId)
      })
    }, this.isServiceConnected(serviceId) ? HTML5_NOTIFICATION_DELAY : 0)
  }
}

export default alt.createStore(SlackStore, 'SlackStore')
