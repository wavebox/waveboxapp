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
import CRExtensionWebRequestListener from './CRExtensionWebRequestListener'

class CRExtensionWebRequest {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    if (this.extension.manifest.permissions.has('webRequest')) {
      this.onBeforeRequest = new CRExtensionWebRequestListener(
        `${CRX_WEB_REQUEST_ON_BEFORE_REQUEST_ADD_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_BEFORE_REQUEST_REMOVE_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_BEFORE_REQUEST_}${this.extension.id}`,
        'beforeRequest'
      )
      this.onBeforeSendHeaders = new CRExtensionWebRequestListener(
        `${CRX_WEB_REQUEST_ON_BEFORE_SEND_HEADERS_ADD_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_BEFORE_SEND_HEADERS_REMOVE_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_BEFORE_SEND_HEADERS_}${this.extension.id}`,
        'beforeSendHeaders'
      )
      this.onSendHeaders = new CRExtensionWebRequestListener(
        `${CRX_WEB_REQUEST_ON_SEND_HEADERS_ADD_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_SEND_HEADERS_REMOVE_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_SEND_HEADERS_}${this.extension.id}`,
        'sendHeaders'
      )
      this.onHeadersReceived = new CRExtensionWebRequestListener(
        `${CRX_WEB_REQUEST_ON_HEADERS_RECEIVED_ADD_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_HEADERS_RECEIVED_REMOVE_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_HEADERS_RECEIVED_}${this.extension.id}`,
        'headersReceived'
      )
      this.onResponseStarted = new CRExtensionWebRequestListener(
        `${CRX_WEB_REQUEST_ON_RESPONSE_STARTED_ADD_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_RESPONSE_STARTED_REMOVE_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_RESPONSE_STARTED_}${this.extension.id}`,
        'responseStarted'
      )
      this.onBeforeRedirect = new CRExtensionWebRequestListener(
        `${CRX_WEB_REQUEST_ON_BEFORE_REDIRECT_ADD_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_BEFORE_REDIRECT_REMOVE_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_BEFORE_REDIRECT_}${this.extension.id}`,
        'beforeRedirect'
      )
      this.onCompleted = new CRExtensionWebRequestListener(
        `${CRX_WEB_REQUEST_ON_COMPLETED_ADD_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_COMPLETED_REMOVE_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_COMPLETED_}${this.extension.id}`,
        'completed'
      )
      this.onErrorOccurred = new CRExtensionWebRequestListener(
        `${CRX_WEB_REQUEST_ON_ERROR_OCCURRED_ADD_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_ERROR_OCCURRED_REMOVE_}${this.extension.id}`,
        `${CRX_WEB_REQUEST_ON_ERROR_OCCURRED_}${this.extension.id}`,
        'errorOccurred'
      )
    }
  }

  destroy () {
    if (this.extension.manifest.permissions.has('webRequest')) {
      this.onBeforeRequest.destroy()
      this.onBeforeSendHeaders.destroy()
      this.onSendHeaders.destroy()
      this.onHeadersReceived.destroy()
      this.onResponseStarted.destroy()
      this.onBeforeRedirect.destroy()
      this.onCompleted.destroy()
      this.onErrorOccurred.destroy()
    }
  }
}

export default CRExtensionWebRequest
