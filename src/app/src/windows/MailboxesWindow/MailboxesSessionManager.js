import {session} from 'electron'
import mailboxStore from 'stores/mailboxStore'
import settingStore from 'stores/settingStore'
import pkg from 'package.json'
import {
  ARTIFICIAL_COOKIE_PERSIST_WAIT,
  ARTIFICIAL_COOKIE_PERSIST_PERIOD
} from 'shared/constants'
import MailboxFactory from 'shared/Models/Accounts/MailboxFactory'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import { CRExtensionManager } from 'Extensions/Chrome'
import { DownloadManager } from 'Download'

class MailboxesSessionManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param mailboxWindow: the mailbox window instance we're working for
  */
  constructor () {
    this.lastUsedDownloadPath = null
    this.downloadsInProgress = { }
    this.persistCookieThrottle = { }

    this.__managed__ = new Set()
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @param partition: the partition id
  * @return the mailbox model for the partition
  */
  getMailboxFromPartition (partition) {
    return mailboxStore.getMailbox(partition.replace('persist:', ''))
  }

  /* ****************************************************************************/
  // Setup & Auth
  /* ****************************************************************************/

  /**
  * Starts managing a session
  * @param parition the name of the partion to manage
  * @param mailboxType: the type of mailbox we're managing for
  */
  startManagingSession (partition, mailboxType) {
    if (this.__managed__.has(partition)) { return }

    const ses = session.fromPartition(partition)
    const mailbox = this.getMailboxFromPartition(partition)

    // Downloads
    DownloadManager.setupUserDownloadHandlerForPartition(partition)

    // Permissions & env
    ses.setPermissionRequestHandler(this.handlePermissionRequest)
    this.setupUserAgent(ses, partition, mailboxType)
    if (mailbox && mailbox.artificiallyPersistCookies) {
      ses.webRequest.onCompleted((evt) => {
        this.artificiallyPersistCookies(partition)
      })
    }

    // Extensions
    ses.webRequest.onHeadersReceived((details, responder) => {
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
  setupUserAgent (ses, partition, mailboxType) {
    const defaultUA = ses.getUserAgent()
      .replace( // Replace electron with our version of Wavebox
        `Electron/${process.versions.electron}`,
        `${pkg.name.charAt(0).toUpperCase()}${pkg.name.slice(1)}/${pkg.version}`
      )

    // Handle accounts that have custom settings
    if (mailboxType === CoreMailbox.MAILBOX_TYPES.GENERIC) {
      const mailbox = this.getMailboxFromPartition(partition)
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
  handlePermissionRequest (webContents, permission, fn) {
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
  artificiallyPersistCookies (partition) {
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

export default MailboxesSessionManager
