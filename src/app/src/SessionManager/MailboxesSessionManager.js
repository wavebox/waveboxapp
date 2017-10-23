import {session, ipcMain} from 'electron'
import {EventEmitter} from 'events'
import mailboxStore from 'stores/mailboxStore'
import settingStore from 'stores/settingStore'
import pkg from 'package.json'
import {
  ARTIFICIAL_COOKIE_PERSIST_WAIT,
  ARTIFICIAL_COOKIE_PERSIST_PERIOD
} from 'shared/constants'
import {
  WB_PREPARE_MAILBOX_SESSION
} from 'shared/ipcEvents'
import MailboxFactory from 'shared/Models/Accounts/MailboxFactory'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import { CRExtensionManager } from 'Extensions/Chrome'
import { DownloadManager } from 'Download'
import SessionManager from './SessionManager'

class MailboxesSessionManager extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param mailboxWindow: the mailbox window instance we're working for
  */
  constructor () {
    super()
    this._setup = false
    this.lastUsedDownloadPath = null
    this.downloadsInProgress = { }
    this.persistCookieThrottle = { }

    this.__managed__ = new Set()
  }

  /**
  * Binds the listeners and starts responding to requests
  */
  start () {
    if (this._setup) { return }
    this._setup = true

    ipcMain.on(WB_PREPARE_MAILBOX_SESSION, (evt, data) => {
      const nowManaging = this._startManagingSession(data.partition, data.mailboxType)
      if (nowManaging) {
        this.emit('session-managed', session.fromPartition(data.partition))
      }
      evt.returnValue = nowManaging
    })
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @return all currently managed sessions
  */
  getAllSessions () {
    return Array.from(this.__managed__).map((partition) => {
      return session.fromPartition(partition)
    })
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @param partition: the partition id
  * @return the mailbox model for the partition
  */
  _getMailboxFromPartition (partition) {
    return mailboxStore.getMailbox(partition.replace('persist:', ''))
  }

  /* ****************************************************************************/
  // Setup & Auth
  /* ****************************************************************************/

  /**
  * Starts managing a session
  * @param parition the name of the partion to manage
  * @param mailboxType: the type of mailbox we're managing for
  * @return true if this is a new session and its now being managed, false otherwise
  */
  _startManagingSession (partition, mailboxType) {
    if (this.__managed__.has(partition)) { return false }

    const ses = session.fromPartition(partition)
    const mailbox = this._getMailboxFromPartition(partition)

    // Downloads
    DownloadManager.setupUserDownloadHandlerForPartition(partition)

    // Permissions & env
    ses.setPermissionRequestHandler(this._handlePermissionRequest)
    this._setupUserAgent(ses, partition, mailboxType)
    if (mailbox && mailbox.artificiallyPersistCookies) {
      SessionManager.webRequestEmitterFromSession(ses).completed.on(undefined, (evt) => {
        this._artificiallyPersistCookies(partition)
      })
    }

    // Extensions
    SessionManager.webRequestEmitterFromSession(ses).headersReceived.onBlocking(undefined, (details, responder) => {
      try {
        const updatedHeaders = CRExtensionManager.runtimeHandler.updateContentSecurityPolicy(details.url, details.responseHeaders)
        if (updatedHeaders) {
          responder({ responseHeaders: updatedHeaders })
        } else {
          responder({})
        }
      } catch (ex) {
        console.warn([
          'session.webRequest.onHeadersReceived threw an unknown exception.',
          'This was caught and execution continues, but the side-effect will be unknown',
          ''
        ].join('\n'), ex)
        responder({})
      }
    })
    this.__managed__.add(partition)

    return true
  }

  /* ****************************************************************************/
  // UserAgent
  /* ****************************************************************************/

  /**
  * Sets up the user agent for each mailbox type
  * @param ses: the session object to update
  * @param partition: the partition the useragent is for
  * @param mailboxType: the type of mailbox this is
  */
  _setupUserAgent (ses, partition, mailboxType) {
    const defaultUA = ses.getUserAgent()
      .replace( // Replace electron with our version of Wavebox
        `Electron/${process.versions.electron}`,
        `${pkg.name.charAt(0).toUpperCase()}${pkg.name.slice(1)}/${pkg.version}`
      )

    // Handle accounts that have custom settings
    if (mailboxType === CoreMailbox.MAILBOX_TYPES.GENERIC) {
      const mailbox = this._getMailboxFromPartition(partition)
      if (mailbox && mailbox.useCustomUserAgent && mailbox.customUserAgentString) {
        ses.setUserAgent(mailbox.customUserAgentString)
        return
      }
    }

    // Handle account types that have built in changes
    const mailboxClass = MailboxFactory.getClass(mailboxType)
    if (mailboxClass && mailboxClass.userAgentChanges.length) {
      const ua = mailboxClass.userAgentChanges.reduce((acc, change) => {
        return acc.replace(change[0], change[1])
      }, defaultUA)
      ses.setUserAgent(ua)
      return
    }

    // Use the default UA
    ses.setUserAgent(defaultUA)
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
      fn(settingStore.app.enableGeolocationApi)
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
