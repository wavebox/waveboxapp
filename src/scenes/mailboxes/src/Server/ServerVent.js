const { Socket, LongPoll } = require('phoenixjs')
const { EventEmitter } = require('events')
const { SYNC_SOCKET_URL, SYNC_SOCKET_UPGRADE_INTERVAL } = require('shared/constants')

const userActions = require('stores/user/userActions')
const googleActions = require('stores/google/googleActions')

class ServerVent extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    this._socket = null
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
        clientToken: clientToken
      }
    })
    this._socket.onError(() => {
      console.warn('[SYNCS] Error connecting')
      if (window.navigator.onLine !== false) {
        if (this._socket.transport === window.WebSocket) {
          console.warn('[SYNCS][WebSocket] Next retry LongPoll')
          this._socket.transport = LongPoll
          clearTimeout(this._websocketUpgrade)
          this._websocketUpgrade = setTimeout(() => {
            this._upgradeToWebsocket()
          }, SYNC_SOCKET_UPGRADE_INTERVAL)
        } else if (this._socket.transport === LongPoll) {
          console.warn('[SYNCS][LongPoll] Next retry WebSocket')
          this._socket.transport = window.WebSocket
          clearTimeout(this._websocketUpgrade)
        }
      }
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
    this._pushChannels.clear()

    return this
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
    channel.on('historyChanged', googleActions.mailHistoryIdChangedFromWatch)
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

module.exports = new ServerVent()
