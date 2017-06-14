import { Socket, LongPoll } from 'phoenix'
import { EventEmitter } from 'events'
import { SYNC_SOCKET_URL, SYNC_SOCKET_UPGRADE_INTERVAL } from 'shared/constants'
import Debug from 'Debug'
import userActions from 'stores/user/userActions'
import googleActions from 'stores/google/googleActions'
const pkg = window.appPackage()

class ServerVent extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    this._socket = null
    this._reconnectTO = null
    this._websocketUpgrade = null
    this._clientId = null
    this._clientToken = null
    this._pushChannels = new Map()
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
    if (this._socket) { throw new Error('Socket already setup') }

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
      if (this._socket.transport === window.WebSocket) {
        console.log('[SYNCS][WebSocket] Socket opened')
      } else if (this._socket.transport === LongPoll) {
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
    if (!this._socket) { throw new Error('Socket is not setup') }

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
      const reconnectWait = Math.floor(Math.random() * 4500) + 500

      if (this._socket.transport === window.WebSocket) {
        console.warn(`[SYNCS][WebSocket] Next retry LongPoll in ${reconnectWait}ms`)
        this._socket.transport = LongPoll
      } else if (this._socket.transport === LongPoll) {
        console.warn(`[SYNCS][LongPoll] Next retry WebSocket in ${reconnectWait}ms`)
        this._socket.transport = window.WebSocket
      }

      clearTimeout(this._reconnectTO)
      this._reconnectTO = setTimeout(() => {
        this._socket.connect()
        if (this._socket.transport === LongPoll) {
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
    clientChannel.on('userDetails', userActions.remoteChangeAccount)

    return this
  }

  /* ****************************************************************************/
  // Listening
  /* ****************************************************************************/

  /**
  * Starts listening for google push updates
  * @param mailboxId: the id of the mailbox
  * @param email: the email address to listen for
  * @param pushToken: the token that authenticates us with the push service
  * @return this
  */
  startListeningForGooglePushUpdates (mailboxId, email, pushToken) {
    if (!this._socket) { throw new Error('Unable to listen on channel, socket is not setup') }

    if (this._pushChannels.has(mailboxId)) { return this }
    const channel = this._socket.channel(`googlepush:${email}`, {
      params: {
        token: pushToken
      }
    })
    channel.join()
      .receive('error', (err) => {
        console.error('[SYNCS] Failed to join push channel', err)
        channel.leave()
        this._pushChannels.delete(mailboxId)
      })
      .receive('timeout', () => {
        console.warn('[SYNCS] Warning timeout on push channel. Will retry')
        channel.leave()
        this._pushChannels.delete(mailboxId)
        this.startListeningForGooglePushUpdates(mailboxId, email, pushToken)
      })
    channel.on('historyChanged', (data) => {
      googleActions.mailHistoryIdChangedFromWatch(data)
      Debug.flagLog('googleLogServerPings', `[GOOGLE:PING] unread ${data.emailAddress}`)
    })
    this._pushChannels.set(mailboxId, channel)

    return this
  }

  /**
  * Stops listening for google push updates
  * @param mailboxId: the id of the mailbox
  * @return this
  */
  stopListeningForGooglePushUpdates (mailboxId) {
    if (!this._pushChannels.has(mailboxId)) { return this }
    if (!this._socket) { throw new Error('Unable to unlisten on channel, socket is not setup') }

    this._pushChannels.get(mailboxId).leave()
    this._pushChannels.delete(mailboxId)

    return this
  }
}

export default new ServerVent()
