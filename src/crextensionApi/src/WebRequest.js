import EventUnsupported from './Core/EventUnsupported'

class WebRequest {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/webRequest
  * @param extensionId: the id of the extension
  */
  constructor (extensionId) {
    this.onBeforeRequest = new EventUnsupported('chrome.webRequest.onBeforeRequest')
    this.onBeforeSendHeaders = new EventUnsupported('chrome.webRequest.onBeforeSendHeaders')
    this.onSendHeaders = new EventUnsupported('chrome.webRequest.onSendHeaders')
    this.onHeadersReceived = new EventUnsupported('chrome.webRequest.onHeadersReceived')
    this.onAuthRequired = new EventUnsupported('chrome.webRequest.onAuthRequired')
    this.onResponseStarted = new EventUnsupported('chrome.webRequest.onResponseStarted')
    this.onBeforeRedirect = new EventUnsupported('chrome.webRequest.onBeforeRedirect')
    this.onCompleted = new EventUnsupported('chrome.webRequest.onCompleted')
    this.onErrorOccurred = new EventUnsupported('chrome.webRequest.onErrorOccurred')

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES () { return 20 }
}

export default WebRequest
