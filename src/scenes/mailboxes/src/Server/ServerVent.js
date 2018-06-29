import { Socket, LongPoll } from 'phoenix'
import { EventEmitter } from 'events'
import Debug from 'Debug'
import userActions from 'stores/user/userActions'
import googleActions from 'stores/google/googleActions'
import {
  SYNC_SOCKET_URL,
  SYNC_SOCKET_UPGRADE_INTERVAL,
  SYNC_SOCKET_RECONNECT_MIN,
  SYNC_SOCKET_RECONNECT_RANGE
} from 'shared/constants'
import pkg from 'package.json'

class ServerVent extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    this._socket = null
    this._reconnectTO = null
    this._websocketUpgrade = null
    this._socketMaintenanceUntil = 0
    this._socketMaintenanceReconnectMin = SYNC_SOCKET_RECONNECT_MIN
    this._socketMaintenanceReconnectRange = SYNC_SOCKET_RECONNECT_RANGE
    this._clientId = null
    this._clientToken = null
    this._pushChannels = new Map()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isSocketSetup () { return !!this._socket }
  get isSocketUsingLongPoll () { return this._socket && this._socket.transport === LongPoll }
  get isSocketUsingWebSocket () { return this._socket && this._socket.transport === window.WebSocket }
  get isSocketConnected () { return this._socket && this._socket.isConnected() }
  get isSocketUnderMaintenance () { return new Date().getTime() < this._socketMaintenanceUntil }
  get socketReconnectTimeout () {
    if (this.isSocketUnderMaintenance) {
      return Math.floor(Math.random() * this._socketMaintenanceReconnectRange) + this._socketMaintenanceReconnectMin
    } else {
      return Math.floor(Math.random() * SYNC_SOCKET_RECONNECT_RANGE) + SYNC_SOCKET_RECONNECT_MIN
    }
  }

  /* ****************************************************************************/
  // Socket lifecycle
  /* ****************************************************************************/

  /**
  * Starts the websocket
  * @param clientId: the id of the authenticated client
  * @param clientToken: the token of the authenticated client
  * @return this
  */
  start (clientId, clientToken) {
    if (this.isSocketSetup) { throw new Error('Socket already setup') }

    this._clientId = clientId
    this._clientToken = clientToken

    this._socket = new Socket(SYNC_SOCKET_URL, {
      params: {
        clientId: clientId,
        clientToken: clientToken,
        version: pkg.version,
        ident: pkg.name
      }
    })
    this._socket.onError(() => {
      this._handleSocketError()
    })
    this._socket.onOpen(() => {
      if (this.isSocketUsingWebSocket) {
        console.log('[SYNCS][WebSocket] Socket opened')
      } else if (this.isSocketUsingLongPoll) {
        console.log('[SYNCS][LongPoll] Socket opened')
      }
    })
    this._socket.connect()
    this._setupVents()

    return this
  }

  /**
  * Stops the sync socket
  * @return this
  */
  stop () {
    if (!this.isSocketSetup) { throw new Error('Socket is not setup') }

    this._socket.disconnect()
    this._socket = null
    clearTimeout(this._websocketUpgrade)
    clearTimeout(this._reconnectTO)
    this._pushChannels.clear()

    return this
  }

  /* ****************************************************************************/
  // Reconnection lifecycle
  /* ****************************************************************************/

  /**
  * Handles the socket coming down in an error
  */
  _handleSocketError () {
    console.warn('[SYNCS] Error connecting')
    if (window.navigator.onLine !== false) {
      this._socket.disconnect()
      const reconnectWait = this.socketReconnectTimeout

      if (this.isSocketUnderMaintenance) {
        if (this.isSocketUsingWebSocket) {
          console.warn(`[SYNCS][WebSocket] Next retry in ${reconnectWait}ms (maintenance mode)`)
        } else if (this.isSocketUsingLongPoll) {
          console.warn(`[SYNCS][LongPoll] Next retry in ${reconnectWait}ms (maintenance mode)`)
        }
      } else {
        if (this.isSocketUsingWebSocket) {
          console.warn(`[SYNCS][WebSocket] Next retry LongPoll in ${reconnectWait}ms`)
          this._socket.transport = LongPoll
        } else if (this.isSocketUsingLongPoll) {
          console.warn(`[SYNCS][LongPoll] Next retry WebSocket in ${reconnectWait}ms`)
          this._socket.transport = window.WebSocket
        }
      }

      clearTimeout(this._reconnectTO)
      this._reconnectTO = setTimeout(() => {
        this._socket.connect()
        if (this.isSocketUsingLongPoll) {
          this._scheduleWebsocketUpgrade()
        } else if (this._socket.transport === window.WebSocket) {
          clearTimeout(this._websocketUpgrade)
        }
      }, reconnectWait)
    }
  }

  /**
  * Schedules an upgrade to websocket
  */
  _scheduleWebsocketUpgrade () {
    clearTimeout(this._websocketUpgrade)
    this._websocketUpgrade = setTimeout(() => {
      this._upgradeToWebsocket()
    }, SYNC_SOCKET_UPGRADE_INTERVAL)
  }

  /**
  * Upgrades the connection to a websocket if possible
  */
  _upgradeToWebsocket () {
    if (this._socket && this._socket.transport !== window.WebSocket) {
      console.log('[SYNCS] Upgrading to WebSocket')
      this._socket.disconnect()
      this._socket.transport = window.WebSocket
      this._socket.connect()
    }
  }

  /**
  * Puts the socket into Maintenance mode
  * @param data: the data passed down the socket
  */
  _handleMaintenanceStart = (data) => {
    if (typeof (data.period) === 'number') {
      this._socketMaintenanceUntil = new Date().getTime() + data.period
    } else {
      this._socketMaintenanceUntil = 0
    }

    if (typeof (data.waitMin) === 'number' && typeof (data.waitRange) === 'number') {
      this._socketMaintenanceReconnectMin = data.waitMin
      this._socketMaintenanceReconnectRange = data.waitRange
    } else {
      this._socketMaintenanceReconnectMin = SYNC_SOCKET_RECONNECT_MIN
      this._socketMaintenanceReconnectRange = SYNC_SOCKET_RECONNECT_RANGE
    }
    console.warn(`[SYNCS] Socket is now in maintenance mode until ${new Date(this._socketMaintenanceUntil)}`)
  }

  /* ****************************************************************************/
  // Venting
  /* ****************************************************************************/

  /**
  * Sets up the vents which punch through to the actions
  * @return this
  */
  _setupVents () {
    const clientChannel = this._socket.channel(`client:${this._clientId}`, { })
    clientChannel.join()
      .receive('ok', (resp) => {
        clientChannel.push('init', {})
      })
      .receive('error', (err) => {
        console.error('[SYNCS] Failed to join client channel', err)
      })
      .receive('timeout', () => {
        console.warn('[SYNCS] Warning timeout on client channel. Will retry')
        clientChannel.leave()
        this._setupVents()
      })
    clientChannel.on('userDetails', (data) => { userActions.setUser(data, new Date().getTime()) })
    clientChannel.on('maintenance', this._handleMaintenanceStart)

    return this
  }

  /* ****************************************************************************/
  // Listening
  /* ****************************************************************************/

  /**
  * Starts listening for google push updates
  * @param serviceId: the id of the service
  * @param email: the email address to listen for
  * @param pushToken: the token that authenticates us with the push service
  * @return this
  */
  startListeningForGooglePushUpdates (serviceId, email, pushToken) {
    if (!this.isSocketSetup) { throw new Error('Unable to listen on channel, socket is not setup') }

    if (this._pushChannels.has(serviceId)) { return this }
    const channel = this._socket.channel(`googlepush:${email}`, {
      params: {
        token: pushToken
      }
    })
    channel.join()
      .receive('error', (err) => {
        console.error('[SYNCS] Failed to join push channel', err)
        channel.leave()
        this._pushChannels.delete(serviceId)
      })
      .receive('timeout', () => {
        console.warn('[SYNCS] Warning timeout on push channel. Will retry')
        channel.leave()
        this._pushChannels.delete(serviceId)
        this.startListeningForGooglePushUpdates(serviceId, email, pushToken)
      })
    channel.on('historyChanged', (data) => {
      googleActions.mailHistoryIdChangedFromWatch(data)
      Debug.flagLog('googleLogServerPings', `[GOOGLE:PING] unread ${data.emailAddress}`)
    })
    this._pushChannels.set(serviceId, channel)

    return this
  }

  /**
  * Stops listening for google push updates
  * @param serviceId: the id of the service
  * @return this
  */
  stopListeningForGooglePushUpdates (serviceId) {
    if (!this._pushChannels.has(serviceId)) { return this }
    if (!this.isSocketSetup) { throw new Error('Unable to unlisten on channel, socket is not setup') }

    this._pushChannels.get(serviceId).leave()
    this._pushChannels.delete(serviceId)

    return this
  }
}

export default new ServerVent()
