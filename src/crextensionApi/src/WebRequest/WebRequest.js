import WebRequestEvent from './WebRequestEvent'
import {
  CRX_WEB_REQUEST_ON_BEFORE_REQUEST_,
  CRX_WEB_REQUEST_ON_BEFORE_REQUEST_ADD_,
  CRX_WEB_REQUEST_ON_BEFORE_REQUEST_REMOVE_,

  CRX_WEB_REQUEST_ON_BEFORE_SEND_HEADERS_,
  CRX_WEB_REQUEST_ON_BEFORE_SEND_HEADERS_ADD_,
  CRX_WEB_REQUEST_ON_BEFORE_SEND_HEADERS_REMOVE_,

  CRX_WEB_REQUEST_ON_SEND_HEADERS_,
  CRX_WEB_REQUEST_ON_SEND_HEADERS_ADD_,
  CRX_WEB_REQUEST_ON_SEND_HEADERS_REMOVE_,

  CRX_WEB_REQUEST_ON_HEADERS_RECEIVED_,
  CRX_WEB_REQUEST_ON_HEADERS_RECEIVED_ADD_,
  CRX_WEB_REQUEST_ON_HEADERS_RECEIVED_REMOVE_,

  CRX_WEB_REQUEST_ON_RESPONSE_STARTED_,
  CRX_WEB_REQUEST_ON_RESPONSE_STARTED_ADD_,
  CRX_WEB_REQUEST_ON_RESPONSE_STARTED_REMOVE_,

  CRX_WEB_REQUEST_ON_BEFORE_REDIRECT_,
  CRX_WEB_REQUEST_ON_BEFORE_REDIRECT_ADD_,
  CRX_WEB_REQUEST_ON_BEFORE_REDIRECT_REMOVE_,

  CRX_WEB_REQUEST_ON_COMPLETED_,
  CRX_WEB_REQUEST_ON_COMPLETED_ADD_,
  CRX_WEB_REQUEST_ON_COMPLETED_REMOVE_,

  CRX_WEB_REQUEST_ON_ERROR_OCCURRED_,
  CRX_WEB_REQUEST_ON_ERROR_OCCURRED_ADD_,
  CRX_WEB_REQUEST_ON_ERROR_OCCURRED_REMOVE_
} from 'shared/crExtensionIpcEvents'

const privExtensionId = Symbol('privExtensionId')

class WebRequest {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/webRequest
  * @param extensionId: the id of the extension
  * @param hasBlockingPermission: true if the extension has blocking permission
  */
  constructor (extensionId) {
    this[privExtensionId] = extensionId

    this.onBeforeRequest = new WebRequestEvent(
      'onBeforeRequest',
      `${CRX_WEB_REQUEST_ON_BEFORE_REQUEST_ADD_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_BEFORE_REQUEST_REMOVE_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_BEFORE_REQUEST_}${extensionId}`)
    this.onBeforeSendHeaders = new WebRequestEvent(
      'onBeforeSendHeaders',
      `${CRX_WEB_REQUEST_ON_BEFORE_SEND_HEADERS_ADD_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_BEFORE_SEND_HEADERS_REMOVE_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_BEFORE_SEND_HEADERS_}${extensionId}`)
    this.onSendHeaders = new WebRequestEvent(
      'onSendHeaders',
      `${CRX_WEB_REQUEST_ON_SEND_HEADERS_ADD_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_SEND_HEADERS_REMOVE_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_SEND_HEADERS_}${extensionId}`)
    this.onHeadersReceived = new WebRequestEvent(
      'onHeadersReceived',
      `${CRX_WEB_REQUEST_ON_HEADERS_RECEIVED_ADD_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_HEADERS_RECEIVED_REMOVE_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_HEADERS_RECEIVED_}${extensionId}`)
    this.onBeforeRedirect = new WebRequestEvent(
      'onBeforeRedirect',
      `${CRX_WEB_REQUEST_ON_BEFORE_REDIRECT_ADD_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_BEFORE_REDIRECT_REMOVE_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_BEFORE_REDIRECT_}${extensionId}`)
    this.onResponseStarted = new WebRequestEvent(
      'onResponseStarted',
      `${CRX_WEB_REQUEST_ON_RESPONSE_STARTED_ADD_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_RESPONSE_STARTED_REMOVE_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_RESPONSE_STARTED_}${extensionId}`)
    this.onCompleted = new WebRequestEvent(
      'onCompleted',
      `${CRX_WEB_REQUEST_ON_COMPLETED_ADD_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_COMPLETED_REMOVE_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_COMPLETED_}${extensionId}`)
    this.onErrorOccurred = new WebRequestEvent(
      'onErrorOccurred',
      `${CRX_WEB_REQUEST_ON_ERROR_OCCURRED_ADD_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_ERROR_OCCURRED_REMOVE_}${extensionId}`,
      `${CRX_WEB_REQUEST_ON_ERROR_OCCURRED_}${extensionId}`)

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES () { return 20 }
}

export default WebRequest
