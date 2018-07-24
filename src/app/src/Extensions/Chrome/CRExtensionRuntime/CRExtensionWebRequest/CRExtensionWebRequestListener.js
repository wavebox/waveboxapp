import { ipcMain, webContents } from 'electron'
import CRExtensionMatchPatterns from 'shared/Models/CRExtension/CRExtensionMatchPatterns'
import { AccountSessionManager, SessionManager } from 'SessionManager'

class CRExtensionWebRequestListener {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param addEventName: the name of the event used to add a listener
  * @param removeEventName: the name of the event used to remove a listener
  * @param triggerEventName: the name of the event that triggers
  * @param webRequestEmitterEventName: the name of the webRequest event name
  */
  constructor (addEventName, removeEventName, triggerEventName, webRequestEmitterEventName) {
    this.addEventName = addEventName
    this.removeEventName = removeEventName
    this.triggerEventName = triggerEventName
    this.webRequestEmitterEventName = webRequestEmitterEventName
    this.listeners = new Map()

    // Bind
    ipcMain.on(this.addEventName, this._handleAddListener)
    ipcMain.on(this.removeEventName, this._handleRemoveListener)
    AccountSessionManager.on('session-managed', this._handleSessionManaged)
  }

  destroy () {
    AccountSessionManager.removeListener('session-managed', this._handleSessionManaged)
    Array.from(this.listeners.keys()).forEach((id) => {
      this._handleRemoveListener(null, id)
    })
  }

  /* ****************************************************************************/
  // Handlers: Web Contents
  /* ****************************************************************************/

  /**
  * Handles session being created by binding all current listeners into it
  * @param ses: the new session
  */
  _handleSessionManaged = (ses) => {
    Array.from(this.listeners.values()).forEach(({ proxyListener, urlFilter, filter }) => {
      this._attachListenerToWebRequest(ses, urlFilter, proxyListener)
    })
  }

  /* ****************************************************************************/
  // Handlers: Add & Remove listener
  /* ****************************************************************************/

  /**
  * Handles a listener being added
  * @param evt: the event that fired
  * @param id: the id of the listener
  * @param filter: the filter for the listener
  * @param optExtraInfoSpec: the optional info spec
  */
  _handleAddListener = (evt, id, filter, optExtraInfoSpec) => {
    // Sanitize some input
    filter = typeof (filter) === 'object' ? filter : {}
    filter.urls = Array.isArray(filter.urls) ? filter.urls : []
    optExtraInfoSpec = Array.isArray(optExtraInfoSpec) ? optExtraInfoSpec : []

    // Build a proxy listener
    const hasAllUrlMatch = CRExtensionMatchPatterns.hasAllUrlMatch(filter.urls || [])
    const urlFiler = hasAllUrlMatch ? undefined : filter.urls
    const proxyListener = this._buildProxyListener(evt.sender.id, this.triggerEventName, id, filter, new Set(optExtraInfoSpec))
    this.listeners.set(id, {
      proxyListener: proxyListener,
      filter: filter,
      urlFiler: urlFiler
    })

    // Bind
    AccountSessionManager.getAllSessions().forEach((ses) => {
      this._attachListenerToWebRequest(ses, urlFiler, proxyListener)
    })
  }

  /**
  * Handles a listener being removed
  * @param evt: the event that fired
  * @param id: the id of the listener
  */
  _handleRemoveListener = (evt, id) => {
    const listener = this.listeners.get(id)
    if (!listener) { return }

    this.listeners.delete(id)
    this._detachListenerFromAllWebRequests(listener.proxyListener)
  }

  /* ****************************************************************************/
  // Building
  /* ****************************************************************************/

  /**
  * Builds a new proxy listener
  * @param targetWebContentsId: the id of the webcontent to return the response to
  * @param triggerEventName: the name of the event to send the trigger back to
  * @param listenerId: the id of the listener
  * @param filter: the filter for the listener
  * @param optExtraInfoSpec: the optional extra info spec as a set
  */
  _buildProxyListener = (targetWebContentsId, triggerEventName, listenerId, filter, optExtraInfoSpec) => {
    return function (details) {
      const target = webContents.fromId(targetWebContentsId)
      if (target.isDestroyed()) { return }

      // Additional filter steps
      if (filter.tabId !== undefined && filter.tabId !== details.webContentsId) { return }
      if (Array.isArray(filter.types) && filter.types.length) {
        if (filter.types.indexOf(details.resourceType) === -1) {
          return
        }
      }

      // Dump the kitchen sink into here - when it json stringified undefined's will be dropped
      const passDetails = {
        requestId: `${details.id}`,
        url: details.url,
        method: details.method,
        frameId: 0,
        parentFrameId: -1,
        tabId: details.webContentsId,
        type: details.resourceType,
        timeStamp: details.timestamp,

        // Request specific stuff
        statusLine: details.statusLine, // onHeadersReceived, onResponseStarted, onBeforeRedirect, onCompleted
        statusCode: details.statusCode, // onHeadersReceived, onResponseStarted, onBeforeRedirect, onCompleted
        fromCache: details.fromCache, // onResponseStarted, onBeforeRedirect, onCompleted, onErrorOccurred
        ip: details.ip, // onBeforeRedirect
        redirectUrl: details.redirectURL, // onBeforeRedirect
        error: details.error, // onErrorOccurred

        // Optional request specific stuff
        requestBody: optExtraInfoSpec.has('requestBody') ? details.uploadData : undefined, // onBeforeRequest
        requestHeaders: optExtraInfoSpec.has('requestHeaders') ? details.requestHeaders : undefined, // onBeforeSendHeaders, onSendHeaders
        responseHeaders: optExtraInfoSpec.has('responseHeaders') ? details.responseHeaders : undefined // onHeadersReceived, onResponseStarted, onBeforeRedirect, onCompleted
      }

      target.send(triggerEventName, listenerId, passDetails)
    }
  }

  /* ****************************************************************************/
  // WebRequest helpers
  /* ****************************************************************************/

  /**
  * Attaches a listener to a web request, checking its valid first
  * @param ses: the session
  * @param filterUrls: the filter urls
  * @param listener: the listener to bind
  */
  _attachListenerToWebRequest (ses, filterUrls, listener) {
    SessionManager.webRequestEmitterFromSession(ses)[this.webRequestEmitterEventName].on(filterUrls, listener)
  }

  /**
  * Detaches a listener from all web requests
  * @param listener: the listener to bind
  */
  _detachListenerFromAllWebRequests (listener) {
    AccountSessionManager.getAllSessions().forEach((ses) => {
      if (SessionManager.hasWebRequestEmitterForSession(ses)) {
        SessionManager.webRequestEmitterFromSession(ses)[this.webRequestEmitterEventName].removeListener(listener)
      }
    })
  }
}

export default CRExtensionWebRequestListener
