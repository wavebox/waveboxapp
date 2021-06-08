import WebRequestEmitterEvent from './WebRequestEmitterEvent'

class WebRequestEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param webRequest: the web request to bind to. Note all bound listeners will be removed
  */
  constructor (webRequest) {
    this.beforeRequest = new WebRequestEmitterEvent(true, (filter, listener) => {
      if (filter) {
        webRequest.onBeforeRequest(filter, listener)
      } else {
        webRequest.onBeforeRequest(listener)
      }
    })
    this.beforeSendHeaders = new WebRequestEmitterEvent(true, (filter, listener) => {
      if (filter) {
        webRequest.onBeforeSendHeaders(filter, listener)
      } else {
        webRequest.onBeforeSendHeaders(listener)
      }
    })
    this.sendHeaders = new WebRequestEmitterEvent(false, (filter, listener) => {
      if (filter) {
        webRequest.onSendHeaders(filter, listener)
      } else {
        webRequest.onSendHeaders(listener)
      }
    })
    this.headersReceived = new WebRequestEmitterEvent(true, (filter, listener) => {
      if (filter) {
        webRequest.onHeadersReceived(filter, listener)
      } else {
        webRequest.onHeadersReceived(listener)
      }
    })
    this.responseStarted = new WebRequestEmitterEvent(false, (filter, listener) => {
      if (filter) {
        webRequest.onResponseStarted(filter, listener)
      } else {
        webRequest.onResponseStarted(listener)
      }
    })
    this.beforeRedirect = new WebRequestEmitterEvent(false, (filter, listener) => {
      if (filter) {
        webRequest.onBeforeRedirect(filter, listener)
      } else {
        webRequest.onBeforeRedirect(listener)
      }
    })
    this.completed = new WebRequestEmitterEvent(false, (filter, listener) => {
      if (filter) {
        webRequest.onCompleted(filter, listener)
      } else {
        webRequest.onCompleted(listener)
      }
    })
    this.errorOccurred = new WebRequestEmitterEvent(false, (filter, listener) => {
      if (filter) {
        webRequest.onErrorOccurred(filter, listener)
      } else {
        webRequest.onErrorOccurred(listener)
      }
    })
  }

  /**
  * Tears everything down by removing all listeners for all handlers
  */
  unbind () {
    this.beforeRequest.removeAllListeners()
    this.beforeSendHeaders.removeAllListeners()
    this.sendHeaders.removeAllListeners()
    this.headersReceived.removeAllListeners()
    this.responseStarted.removeAllListeners()
    this.beforeRedirect.removeAllListeners()
    this.completed.removeAllListeners()
    this.errorOccurred.removeAllListeners()
  }
}

export default WebRequestEmitter
