import {session, app} from 'electron'
import {EventEmitter} from 'events'
import {
  ARTIFICIAL_COOKIE_PERSIST_WAIT,
  ARTIFICIAL_COOKIE_PERSIST_PERIOD
} from 'shared/constants'
import { CRExtensionManager } from 'Extensions/Chrome'
import { DownloadManager } from 'Download'
import { PermissionManager } from 'Permissions'
import SessionManager from './SessionManager'

const privManaged = Symbol('privManaged')
const privEarlyManaged = Symbol('privEarlyManaged')
const privSetup = Symbol('privSetup')
const privPersistCookieThrottle = Symbol('privPersistCookieThrottle')

class AccountSessionManager extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()
    this[privSetup] = false
    this[privPersistCookieThrottle] = {}
    this[privManaged] = new Set()

    // Sessions can only be accessed once the app is ready. We have eager classes trying
    // to setup management, so queue those up
    if (!app.isReady()) {
      this[privEarlyManaged] = new Map()
      app.on('ready', () => {
        Array.from(this[privEarlyManaged].values()).forEach((args) => {
          this._startManagingSession(...args)
        })
        delete this[privEarlyManaged]
      })
    }
  }

  /**
  * Binds the listeners and starts responding to requests
  */
  start () {
    if (this[privSetup]) { return }
    this[privSetup] = true
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @return all currently managed sessions
  */
  getAllSessions () {
    return Array.from(this[privManaged]).map((partition) => {
      return session.fromPartition(partition)
    })
  }

  /* ****************************************************************************/
  // Setup & Auth
  /* ****************************************************************************/

  /**
  * Starts managing a session
  * @param mailbox: the mailbox to start managing
  */
  startManagingMailbox (mailbox) {
    if (!mailbox) { return }
    this._startManagingSession(
      mailbox.partitionId,
      mailbox.artificiallyPersistCookies,
      mailbox.useCustomUserAgent,
      mailbox.customUserAgentString
    )
  }

  /**
  * Starts managing a session
  * @param mailbox: the mailbox the service belongs to
  * @param service: the service to start managing
  */
  startManagingService (mailbox, service) {
    if (!mailbox || !service) { return }
    if (!service.sandboxFromMailbox) { return }
    this._startManagingSession(
      service.partitionId,
      mailbox.artificiallyPersistCookies,
      mailbox.useCustomUserAgent,
      mailbox.customUserAgentString
    )
  }

  /**
  * Stops managing a mailbox
  * @param mailbox: the mailbox to stop managing
  */
  stopManagingMailbox (mailbox) {
    if (!mailbox) { return }
    this._stopManagingSession(mailbox.partitionId)
  }

  /**
  * Stops managing a service
  * @param service: the service to stop managing
  */
  stopManagingService (service) {
    if (!service) { return }
    if (!service.sandboxFromMailbox) { return }
    this._stopManagingSession(service.partitionId)
  }

  /**
  * Stops managing a session
  * @param partitionId: the id of the partition
  */
  _stopManagingSession (partitionId) {
    // If you want to break this assumption you have to be 100% sure all bindings to
    // the session have been removed first which is difficult. Also this will need
    // to be cancellable if the code calls start again before the timeout
    const ses = session.fromPartition(partitionId)
    SessionManager.destroyWebRequestEmitterFromSession(ses)
    DownloadManager.teardownUserDownloadHandlerForPartition(partitionId)
    PermissionManager.teardownPermissionHandler(partitionId)
    this[privManaged].delete(partitionId)

    setTimeout(() => {
      // We want to wait a few moments in case it's still in use. We work on the assumption
      // that a session will never be re-used after teardown.
      SessionManager.clearSessionFull(partitionId)
    }, 5000)
  }

  /**
  * Starts managing a session
  * @param partitionId: the id of the partition
  * @param artificiallyPersistCookies: true to artificially persist cookies
  * @param useCustomUserAgent: true to use a custom user agent
  * @param customUserAgentString: the useragent string to use
  */
  _startManagingSession (...args) {
    const [
      partitionId,
      artificiallyPersistCookies,
      useCustomUserAgent,
      customUserAgentString
    ] = args

    // Check if we can init
    if (this[privManaged].has(partitionId)) { return }
    if (!app.isReady()) {
      this[privEarlyManaged].set(partitionId, args); return
    }

    const ses = session.fromPartition(partitionId)

    // Downloads
    DownloadManager.setupUserDownloadHandlerForPartition(partitionId)

    // Permissions & env
    PermissionManager.setupPermissionHandler(partitionId)

    // UA
    if (useCustomUserAgent && customUserAgentString) {
      ses.setUserAgent(customUserAgentString)
    }

    // Cookies
    if (artificiallyPersistCookies) {
      SessionManager.webRequestEmitterFromSession(ses).completed.on(undefined, (evt) => {
        this._artificiallyPersistCookies(partitionId)
      })
    }

    // Extensions: CSP
    SessionManager.webRequestEmitterFromSession(ses).headersReceived.onBlocking(undefined, (details, responder) => {
      const updatedHeaders = CRExtensionManager.runtimeHandler.updateContentSecurityPolicy(details.url, details.responseHeaders)
      if (updatedHeaders) {
        responder({ responseHeaders: updatedHeaders })
      } else {
        responder({})
      }
    })

    // Extensions: XHR
    SessionManager.webRequestEmitterFromSession(ses).beforeSendHeaders.onBlocking(undefined, (details, responder) => {
      const updatedHeaders = CRExtensionManager.runtimeHandler.updateCSXHRBeforeSendHeaders(details)
      if (updatedHeaders) {
        responder({ requestHeaders: updatedHeaders })
      } else {
        responder({})
      }
    })
    SessionManager.webRequestEmitterFromSession(ses).headersReceived.onBlocking(undefined, (details, responder) => {
      const updatedHeaders = CRExtensionManager.runtimeHandler.updateCSXHROnHeadersReceived(details)
      if (updatedHeaders) {
        responder({ responseHeaders: updatedHeaders })
      } else {
        responder({})
      }
    })
    SessionManager.webRequestEmitterFromSession(ses).errorOccurred.on((details) => {
      CRExtensionManager.runtimeHandler.onCSXHRError(details)
    })

    // Extensions: Functionality
    SessionManager.webRequestEmitterFromSession(ses).beforeRequest.onBlocking(undefined, (details, responder) => {
      const modifier = CRExtensionManager.runtimeHandler.runExtensionOnBeforeRequest(details)
      if (modifier) {
        responder(modifier)
      } else {
        responder({})
      }
    })

    this[privManaged].add(partitionId)
    this.emit('session-managed', ses)
  }

  /* ****************************************************************************/
  // Cookies
  /* ****************************************************************************/

  /**
  * Forces the cookies to persist artifically. This helps users using saml signin
  * @param partition: the partition string for this session
  */
  _artificiallyPersistCookies (partition) {
    if (this[privPersistCookieThrottle][partition] !== undefined) { return }
    this[privPersistCookieThrottle][partition] = setTimeout(() => {
      const ses = session.fromPartition(partition)
      ses.cookies.get({ session: true }, (error, cookies) => {
        if (error || !cookies.length) {
          delete this[privPersistCookieThrottle][partition]
          return
        }
        cookies.forEach((cookie) => {
          const url = (cookie.secure ? 'https://' : 'http://') + cookie.domain + cookie.path
          ses.cookies.remove(url, cookie.name, (error) => {
            if (error) { return }
            const expire = new Date().getTime() + ARTIFICIAL_COOKIE_PERSIST_PERIOD
            const persistentCookie = {
              url: url,
              name: cookie.name,
              value: cookie.value,
              domain: cookie.domain,
              path: cookie.path,
              secure: cookie.secure,
              httpOnly: cookie.httpOnly,
              expirationDate: expire
            }
            ses.cookies.set(persistentCookie, (_) => { })
          })
        })
        delete this[privPersistCookieThrottle][partition]
      })
    }, ARTIFICIAL_COOKIE_PERSIST_WAIT)
  }
}

export default new AccountSessionManager()
