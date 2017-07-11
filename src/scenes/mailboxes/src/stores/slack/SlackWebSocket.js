import { EventEmitter } from 'events'
const HEARTBEAT_ID = 'heartbeat'
const HEARTBEAT_SEND_INTERVAL = 1000 * 5
const HEARTBEAT_FAILED_INTERVAL = 1000 * 10
const RECONNECT_WAIT = 1000 * 5

class SlackSocket extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param url: the socket url
  */
  constructor (url) {
    super()

    this._isOpen = false
    this._isConnected = false
    this._url = url
    this._lastResponseTime = 0
    this._heartbeat = null
    this._heartbeatFailed = null
    this._reconnect = null
    this._socket = undefined
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isOpen () { return this._isOpen }
  get isConnected () { return this._isConnected }
  get lastResponseTime () { return this._lastResponseTime }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  /**
  * Handles the connection opening
  * @param evt: the event that fired
  */
  _handleOpen (evt) {
    this._isConnected = true
  }

  /**
  * Handles an incoming message
  * @param evt: the event that fired
  */
  _handleMessage (evt) {
    this._lastResponseTime = new Date().getTime()
    this._heartbeatSchedule()

    const data = JSON.parse(evt.data)
    if (data.type === 'reconnect_url') {
      this._url = data.url
    } else if (data.type === 'pong' && data.reply_to === HEARTBEAT_ID) {
      /* no-op */
    } else {
      this.emit('message', evt, data)
    }
  }

  /**
  * Handles a connection errro
  * @param evt: the event that fired
  */
  _handleError (evt) {
    this._handleDisconnectTeardown()
    clearTimeout(this._reconnect)
    this._reconnect = setTimeout(() => {
      try { this.open() } catch (ex) { }
    }, RECONNECT_WAIT)
  }

  /**
  * Handles the connection closing
  * @param evt: the event that fired
  */
  _handleClose (evt) {
    this._handleDisconnectTeardown()
  }

  /**
  * Ensures the socket is torn down on disconnect
  */
  _handleDisconnectTeardown () {
    if (this._socket) {
      this._socket.close()
      this._socket = undefined
    }
    this._isConnected = false
    this._heartbeatClear()
  }

  /* **************************************************************************/
  // Heartbeat
  /* **************************************************************************/

  /**
  * Clears the current heartbeat
  */
  _heartbeatClear () {
    clearTimeout(this._heartbeat)
    clearTimeout(this._heartbeatFailed)
  }

  /**
  * Schedules the next heartbeat
  */
  _heartbeatSchedule () {
    this._heartbeatClear()
    this._heartbeat = setTimeout(() => {
      this.send({ type: 'ping', id: HEARTBEAT_ID })
    }, HEARTBEAT_SEND_INTERVAL)
    this._heartbeatFailed = setTimeout(() => {
      try { this.close() } catch (ex) { }
      try { this.open() } catch (ex) { }
    }, HEARTBEAT_FAILED_INTERVAL)
  }

  /* **************************************************************************/
  // Socket lifecycle
  /* **************************************************************************/

  /**
  * Opens a connection if one is not already open
  * @return this
  */
  open () {
    if (this._socket) { throw new Error('Socket already open') }

    this._isOpen = true
    this._socket = new window.WebSocket(this._url)
    this._socket.onopen = this._handleOpen.bind(this)
    this._socket.onmessage = this._handleMessage.bind(this)
    this._socket.onerror = this._handleError.bind(this)
    this._socket.onclose = this._handleClose.bind(this)
    this._heartbeatSchedule()

    return this
  }

  /**
  * Closes a connection
  * @return this
  */
  close () {
    if (!this._socket) { throw new Error('No socket to close') }

    this._handleDisconnectTeardown()
    clearTimeout(this._reconnect)

    return this
  }

  /* **************************************************************************/
  // Sending data
  /* **************************************************************************/

  /**
  * Sends data along the wire
  * @param payload: the payload to send
  * @return this
  */
  send (payload) {
    if (!this._socket) { throw new Error('Cannot send. Socket is down') }
    this._socket.send(JSON.stringify(payload))
    return this
  }
}

export default SlackSocket
