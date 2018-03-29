import { VMScript, VM } from 'vm2'
import { URL } from 'url'
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
import CRExtensionMatchPatterns from 'shared/Models/CRExtension/CRExtensionMatchPatterns'

const BLOCKING_ON_BEFORE_REQUEST_ERROR_SUPPRESS_MS = 1000 * 60

class CRExtensionWebRequest {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this._blockingOnBeforeRequestScript = undefined
    this._blockingOnBeforeRequestErrorSuppress = { last: 0, total: 0 }

    if (this.extension.manifest.permissions.has('webRequest')) {
      this._blockingOnBeforeRequestScript = this.extension.manifest.wavebox.webRequestOnBeforeRequestBlockingScript

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

  /* ****************************************************************************/
  // Blocking calls
  /* ****************************************************************************/

  /**
  * Compiles a blocking request
  * @param config: the config to use to compile
  * @return the compiled script or undefined
  */
  _compileBlockingRequest (config) {
    if (config && config.urls && config.js) {
      let compiledJS
      try {
        compiledJS = new VMScript(config.js).compile()
      } catch (ex) {
        console.error(`Failed to compile blocking extension script. Continuing...`, ex)
      }

      if (compiledJS) {
        return { urls: config.urls, js: compiledJS }
      }
    }

    return undefined
  }

  /**
  * Runs the before request code provided by the extension
  * @param details: the details of the request
  * @return modifiers that will cancel or redirect the request or undefined
  */
  blockingOnBeforeRequest = (details) => {
    // Check we support
    if (!this._blockingOnBeforeRequestScript) { return undefined }

    // Check our url matches
    const purl = new URL(details.url)
    const matches = CRExtensionMatchPatterns.matchUrls(
      purl.protocol,
      purl.hostname,
      purl.pathname,
      this._blockingOnBeforeRequestScript.urls
    )
    if (!matches) { return undefined }

    // Prep our lambda function
    const request = {
      requestId: `${details.id}`,
      url: details.url,
      method: details.method,
      frameId: 0,
      parentFrameId: -1,
      tabId: details.webContentsId,
      type: details.resourceType,
      timeStamp: details.timestamp
    }
    const lambdaScript = `
      (function(request) {
        ${this._blockingOnBeforeRequestScript.js}
      })(${JSON.stringify(request)})
    `

    // Run our guest code
    const vm = new VM()
    let modifier
    try {
      modifier = vm.run(lambdaScript)
    } catch (ex) {
      this._blockingOnBeforeRequestErrorSuppress.total++
      if (new Date().getTime() - this._blockingOnBeforeRequestErrorSuppress.last > BLOCKING_ON_BEFORE_REQUEST_ERROR_SUPPRESS_MS) {
        this._blockingOnBeforeRequestErrorSuppress.last = new Date().getTime()
        console.error([
          `Extension Error: Failed to execute blocking onBeforeRequest for extension`,
          `    Extension ID: ${this.extension.id}`,
          `    Subsequent errors will not be reported for another ${BLOCKING_ON_BEFORE_REQUEST_ERROR_SUPPRESS_MS}ms`,
          `    Total Errorred runs: ${this._blockingOnBeforeRequestErrorSuppress.total}`,
          `    Below is a log of the failed code:`,
          '    ---------------',
          '',
          lambdaScript,
          '',
          '    ---------------'
        ].join('\n'))
      }
    }

    // Sanitize output
    if (modifier && modifier.cancel !== undefined) {
      return { cancel: modifier.cancel }
    }

    return undefined
  }
}

export default CRExtensionWebRequest
