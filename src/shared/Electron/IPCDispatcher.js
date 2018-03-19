const privSendTransport = Symbol('privSendTransport')
const privReceiveTransport = Symbol('privReceiveTransport')
const privResultId = Symbol('privResultId')
const privInstanceId = Symbol('privInstanceId')
const privRegisteredHanders = Symbol('privRegisteredHanders')

class IPCDispatcher {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param receiveTransport: the transport mechanism to use for receiving
  * @param sendTransport=undefined: the transport mechanism to use for sending
  */
  constructor (receiveTransport, sendTransport = undefined) {
    this[privReceiveTransport] = receiveTransport
    this[privSendTransport] = sendTransport
    this[privInstanceId] = Math.random()
    this[privResultId] = 0
    this[privRegisteredHanders] = []
  }

  /* **************************************************************************/
  // Id generation
  /* **************************************************************************/

  /**
  * @return the next result id
  */
  getNextResultId () {
    this[privResultId]++
    return `::${this[privInstanceId]}:${this[privResultId]}`
  }

  /* **************************************************************************/
  // Making requests
  /* **************************************************************************/

  /**
  * Makes a request on a target
  * @param sendTransport: the ipc transport to send on
  * @param sendTransportMethod: the method name to call on the transport
  * @param receiveTransport: the ipc transport to receive on
  * @param name: the name of the call
  * @param requestArgs: the args to pass in the call
  * @param callback: the callback to execute on response
  */
  sendRequest (sendTransport, sendTransportMethod, receiveTransport, name, requestArgs, callback) {
    if (!sendTransport) { throw new Error('Send transport is not configured for request') }
    if (!sendTransportMethod) { throw new Error('Send transport method is not configured for request') }
    if (!receiveTransport) { throw new Error('Receive transport is not configured for request') }

    const resultId = this.getNextResultId()
    receiveTransport.once(`${name}_${resultId}`, (evt, err, response) => {
      callback(evt, err, response)
    })
    sendTransport[sendTransportMethod](name, resultId, requestArgs)
  }

  /**
  * Makes a request on a target
  * @param sendTransport: the ipc transport to send on
  * @param name: the name of the call
  * @param requestArgs: the args to pass in the call
  * @param callback: the callback to execute on response
  */
  requestOnTarget (sendTransport, name, requestArgs, callback) {
    this.sendRequest(sendTransport, 'send', this[privReceiveTransport], name, requestArgs, callback)
  }

  /**
  * Makes a request on a target using the sendall call
  * @param sendTransport: the ipc transport to send on
  * @param name: the name of the call
  * @param requestArgs: the args to pass in the call
  * @param callback: the callback to execute on response
  */
  requestAllOnTarget (sendTransport, name, requestArgs, callback) {
    this.sendRequest(sendTransport, 'sendToAll', this[privReceiveTransport], name, requestArgs, callback)
  }

  /**
  * Makes a request with the default send and receive transport
  * @param name: the name of the call
  * @param requestArgs: the args to pass in the call
  * @param callback: the callback to execute on response
  */
  request (name, requestArgs, callback) {
    this.sendRequest(this[privSendTransport], 'send', this[privReceiveTransport], name, requestArgs, callback)
  }

  /* **************************************************************************/
  // Responding
  /* **************************************************************************/

  /**
  * Registers a handler on a target
  * @param receiveTransport: the receiver transport to register on
  * @param name: the name of the handler
  * @param handler: the handle that will accept the response
  *      evt, request, callback
  */
  registerHandlerOnTarget (receiveTransport, name, handler) {
    if (!receiveTransport) { throw new Error('Receive transport is not configured for handler') }

    const registeredHandler = (evt, requestId, request) => {
      handler(evt, request, (err, response) => {
        // Sometimes by the time we come back the return path may have been destroyed. In
        // this case there's not really anything to do as nobody is waiting for or listening
        // on the call. In this case just return. Be careful guarding here because we could
        // have a webContents or ipcRenderer. Only apply the check to webContents
        if (evt && evt.sender && evt.sender.isDestroyed && evt.sender.isDestroyed()) { return }

        evt.sender.send(`${name}_${requestId}`, err, response)
      })
    }

    this[privRegisteredHanders].push({
      name: name,
      handler: handler,
      registeredHandler: registeredHandler,
      registeredTransport: receiveTransport
    })

    receiveTransport.on(name, registeredHandler)
  }

  /**
  * Registers a handler on a the default target
  * @param name: the name of the handler
  * @param handler: the handle that will accept the response
  *      requestArgs, callback
  */
  registerHandler (name, handler) {
    this.registerHandlerOnTarget(this[privReceiveTransport], name, handler)
  }

  /**
  * Unregisters a handler
  * @param name: the name of the handler
  * @param handler: the hanlder that was registered
  */
  unregisterHandler (name, handler) {
    const registeredIndex = this[privRegisteredHanders].findIndex((rec) => rec.name === name && rec.handler === handler)
    if (registeredIndex !== -1) {
      const registered = this[privRegisteredHanders][registeredIndex]
      this[privRegisteredHanders].splice(registeredIndex, 1)
      registered.registeredTransport.removeListener(registered.registeredHandler)
    }
  }
}

module.exports = IPCDispatcher
