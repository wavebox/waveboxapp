import { EventEmitter } from 'events'
import SlackWebSocket from './SlackWebSocket'
import uuid from 'uuid'

class SlackRTM extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param url: the socket url
  */
  constructor (url) {
    super()

    this._requests = new Map()
    this._socket = new SlackWebSocket(url).open()
    this._socket.on('message', this._handleMessage.bind(this))
  }

  close () {
    try {
      this._socket.close()
    } catch (ex) {
      /* no-op */
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isConnected () { return this._socket.isConnected }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles a message returing
  * @param evt: the event that fired
  * @param data: the data from the message
  */
  _handleMessage (evt, data) {
    if (data.reply_to) {
      this._handleRequestResponse(evt, data)
    } else {
      this.emit('message', data)
      this.emit('message:' + data.type, data)
    }
  }

  /**
  * Handles a request response
  * @param evt: the event that fired
  * @param data: the data from the response
  */
  _handleRequestResponse (evt, data) {
    const requestId = data.reply_to
    const request = this._requests.get(requestId)
    if (!request) { return }

    clearTimeout(request.timeout)
    if (request.callback) {
      request.callback(data)
    }
    this._requests.delete(requestId)
  }

  /**
  * Handles a request timeout
  * @param requestId: the id of the request that timed out
  */
  _handleRequestTimeout (requestId) {
    const request = this._requests.get(requestId)
    if (!request) { return }

    clearTimeout(request.timeout)
    if (request.callback) {
      request.callback({
        ok: false,
        error: { code: -100, msg: 'Timeout' }
      })
    }
    this._requests.delete(requestId)
  }

  /* **************************************************************************/
  // Sending data
  /* **************************************************************************/

  /**
  * Sends a message to slack
  * @param type: the type of message
  * @param data: the data to send
  * @param callback=undefined: executed on response
  * @param timeout=undefined: the timeout for the request
  * @return the request id
  */
  send (type, data, callback = undefined, timeout = 10) {
    const requestId = uuid.v4()
    const payload = Object.assign({}, data, {
      type: type,
      id: requestId
    })
    this._requests.set(requestId, {
      callback: callback,
      timeout: setTimeout(() => { this._handleRequestTimeout(requestId) }, timeout)
    })
    this._socket.send(payload)
    return requestId
  }
}

export default SlackRTM
