const { Socket, LongPoll } = require('phoenixjs')
const { EventEmitter } = require('events')
const { SYNC_SOCKET_URL } = require('shared/constants')

const userActions = require('./user/userActions')
const googleActions = require('./google/googleActions')

class ServerVent extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    this._socket = null
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
      console.warn('Error connecting to sync socket')
      if (window.navigator.onLine !== false) {
        if (this._socket.transport === window.WebSocket) {
          console.warn('Error connecting to sync socket using WebSocket - next retry is with LongPoll')
          this._socket.transport = LongPoll
        } else if (this._socket.transport === LongPoll) {
          console.warn('Error connecting to sync socket using LongPoll - next retry is with WebSocket')
          this._socket.transport = window.WebSocket
        }
      }
    })
    this._socket.onOpen(() => { console.log('Sync socket opened') })
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
    this._pushChannels.clear()

    return this
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
        console.error('Failed to join client channel', err)
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
        console.error('Failed to join push channel', err)
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
