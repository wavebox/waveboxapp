import {session, app} from 'electron'
import {EventEmitter} from 'events'
import {settingsStore} from 'stores/settings'
import {
  ARTIFICIAL_COOKIE_PERSIST_WAIT,
  ARTIFICIAL_COOKIE_PERSIST_PERIOD
} from 'shared/constants'
import { CRExtensionManager } from 'Extensions/Chrome'
import { DownloadManager } from 'Download'
import SessionManager from './SessionManager'

const privManaged = Symbol('privManaged')
const privEarlyManaged = Symbol('privEarlyManaged')

class MailboxesSessionManager extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()
    this._setup = false
    this.lastUsedDownloadPath = null
    this.downloadsInProgress = { }
    this.persistCookieThrottle = { }

    this[privManaged] = new Set()

    // Sessions can only be accessed once the app is ready. We have eager classes trying
    // to setup management, so queue those up
    if (!app.isReady()) {
      this[privEarlyManaged] = new Map()
      app.on('ready', () => {
        Array.from(this[privEarlyManaged].values()).forEach((mailbox) => {
          this.startManagingSession(mailbox)
        })
        delete this[privEarlyManaged]
      })
    }
  }

  /**
  * Binds the listeners and starts responding to requests
  */
  start () {
    if (this._setup) { return }
    this._setup = true
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
  startManagingSession (mailbox) {
    if (!app.isReady()) {
      this[privEarlyManaged].set(mailbox.id, mailbox)
      return
    }

    if (this[privManaged].has(mailbox.partitionId)) {
      return
    }

    const ses = session.fromPartition(mailbox.partitionId)

    // Downloads
    DownloadManager.setupUserDownloadHandlerForPartition(mailbox.partitionId)

    // Permissions & env
    ses.setPermissionRequestHandler(this._handlePermissionRequest)
    this._setupUserAgent(ses, mailbox)
    if (mailbox && mailbox.artificiallyPersistCookies) {
      SessionManager.webRequestEmitterFromSession(ses).completed.on(undefined, (evt) => {
        this._artificiallyPersistCookies(mailbox.partitionId)
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

    this[privManaged].add(mailbox.partitionId)
    this.emit('session-managed', ses)
  }

  /* ****************************************************************************/
  // UserAgent
  /* ****************************************************************************/

  /**
  * Sets up the user agent for each mailbox type
  * @param ses: the session object to update
  * @param mailbox: the mailbox to setup for
  */
  _setupUserAgent (ses, mailbox) {
    // Handle accounts that have custom settings
    if (mailbox && mailbox.useCustomUserAgent && mailbox.customUserAgentString) {
      ses.setUserAgent(mailbox.customUserAgentString)
    }
  }

  /* ****************************************************************************/
  // Permissions
  /* ****************************************************************************/

  /**
  * Handles a request for a permission from the client
  * @param webContents: the webcontents the request came from
  * @param permission: the permission name
  * @param fn: execute with response
  */
  _handlePermissionRequest (webContents, permission, fn) {
    if (permission === 'notifications') {
      fn(false)
    } else if (permission === 'geolocation') {
      fn(settingsStore.getState().app.enableGeolocationApi)
    } else {
      fn(true)
    }
  }

  /* ****************************************************************************/
  // Cookies
  /* ****************************************************************************/

  /**
  * Forces the cookies to persist artifically. This helps users using saml signin
  * @param partition: the partition string for this session
  */
  _artificiallyPersistCookies (partition) {
    if (this.persistCookieThrottle[partition] !== undefined) { return }
    this.persistCookieThrottle[partition] = setTimeout(() => {
      const ses = session.fromPartition(partition)
      ses.cookies.get({ session: true }, (error, cookies) => {
        if (error || !cookies.length) {
          delete this.persistCookieThrottle[partition]
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
        delete this.persistCookieThrottle[partition]
      })
    }, ARTIFICIAL_COOKIE_PERSIST_WAIT)
  }
}

export default new MailboxesSessionManager()
