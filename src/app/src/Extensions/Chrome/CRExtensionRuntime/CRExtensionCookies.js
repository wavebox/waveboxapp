import { session } from 'electron'
import CRDispatchManager from '../CRDispatchManager'
import { accountStore } from 'stores/account'
import {
  CRX_COOKIES_GET_,
  CRX_COOKIES_GET_ALL_,
  CRX_COOKIES_SET_,
  CRX_COOKIES_REMOVE_,
  CRX_COOKIES_CHANGED_
} from 'shared/crExtensionIpcEvents'
import CRExtensionBackgroundPage from './CRExtensionBackgroundPage'
import { AccountSessionManager } from 'SessionManager'
import { ElectronCookiePromise } from 'ElectronTools'

const ELECTRON_TO_CRX_COOKIE_CHANGE_CAUSE = {
  'explicit': 'explicit',
  'overwrite': 'overwrite',
  'expired': 'expired',
  'evicted': 'evicted',
  'expired-overwrite': 'expired_overwrite'
}

class CRExtensionCookies {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.backgroundPageSender = null
    this._changeListenerSessions = new Set()
    this._partiallyModifiedCookies = []

    const scopes = this.extension.manifest.wavebox.cookieScopes
    const permissions = this.extension.manifest.permissions

    if (this.extension.manifest.hasBackground && scopes.size > 0 && permissions.has('cookies')) {
      CRDispatchManager.registerHandler(`${CRX_COOKIES_GET_}${this.extension.id}`, this.handleGetCookie)
      CRDispatchManager.registerHandler(`${CRX_COOKIES_GET_ALL_}${this.extension.id}`, this.handleGetAllCookies)
      CRDispatchManager.registerHandler(`${CRX_COOKIES_SET_}${this.extension.id}`, this.handleSetCookie)
      CRDispatchManager.registerHandler(`${CRX_COOKIES_REMOVE_}${this.extension.id}`, this.handleRemoveCookie)

      this._getAllPartitions().forEach((partitionId) => {
        this._handleSessionManaged(session.fromPartition(partitionId))
      })
      if (scopes.has('tabs')) {
        AccountSessionManager.on('session-managed', this._handleSessionManaged)
      }
    }
  }

  destroy () {
    CRDispatchManager.unregisterHandler(`${CRX_COOKIES_GET_}${this.extension.id}`, this.handleGetCookie)
    CRDispatchManager.unregisterHandler(`${CRX_COOKIES_GET_ALL_}${this.extension.id}`, this.handleGetAllCookies)
    CRDispatchManager.unregisterHandler(`${CRX_COOKIES_SET_}${this.extension.id}`, this.handleSetCookie)
    CRDispatchManager.unregisterHandler(`${CRX_COOKIES_REMOVE_}${this.extension.id}`, this.handleRemoveCookie)
    AccountSessionManager.removeListener('session-managed', this._handleSessionManaged)
    Array.from(this._changeListenerSessions).forEach((ses) => {
      ses.cookies.removeListener('changed', this._handleCookiesChanged)
    })
    this._changeListenerSessions.clear()
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @return all the partitions that are currently relevant
  */
  _getAllPartitions () {
    const scopes = this.extension.manifest.wavebox.cookieScopes
    const partitions = []
    if (scopes.has('background')) {
      partitions.push(CRExtensionBackgroundPage.partitionIdForExtension(this.extension.id))
    }
    if (scopes.has('tabs')) {
      accountStore.getState().allPartitions().forEach((partitionId) => {
        partitions.push(partitionId)
      })
    }
    return partitions
  }

  /**
  * @return the session for the background page
  */
  _getBackgroundPageSession () {
    const partitionId = CRExtensionBackgroundPage.partitionIdForExtension(this.extension.id)
    return session.fromPartition(partitionId)
  }

  /**
  * Generates an id for a partially set cookie
  * @param detailsOrCookie: the details or actual cookie
  */
  _partiallyModifiedCookieId (detailsOrCookie) {
    return `${detailsOrCookie.name}:${detailsOrCookie.value}`
  }

  /* ****************************************************************************/
  // Handlers: Session
  /* ****************************************************************************/

  /**
  * Handles session being created by binding all current listeners into it
  * @param ses: the new session
  */
  _handleSessionManaged = (ses) => {
    if (this._changeListenerSessions.has(ses)) { return }
    this._changeListenerSessions.add(ses)
    ses.cookies.on('changed', this._handleCookiesChanged)
  }

  /**
  * Handles the cookies changing
  * @param evt: the event that fired
  * @param cookie: the cookie that was changed
  * @param cause: the cause of the change
  * @param removed: true if the cookie was removed
  */
  _handleCookiesChanged = (evt, cookie, cause, removed) => {
    if (!this.backgroundPageSender) { return }
    if (evt.sender === this._getBackgroundPageSession().cookies) {
      const partialId = this._partiallyModifiedCookieId(cookie)
      if (this._partiallyModifiedCookies.find((id) => id === partialId)) {
        return
      }
    }

    this.backgroundPageSender(`${CRX_COOKIES_CHANGED_}${this.extension.id}`, {
      cause: ELECTRON_TO_CRX_COOKIE_CHANGE_CAUSE[cause],
      cookie: cookie,
      removed: removed
    })
  }

  /* ****************************************************************************/
  // Handlers: Api
  /* ****************************************************************************/

  /**
  * Gets a single cookie
  * @param evt: the event that fired
  * @param [details]: the query details
  * @param responseCallback: executed on completion
  */
  handleGetCookie = (evt, [details], responseCallback) => {
    Promise.resolve()
      .then(() => ElectronCookiePromise.getFromPartitions(this._getAllPartitions(), { url: details.url, name: details.name }, true))
      .then((cookies) => {
        if (cookies.length <= 1) {
          responseCallback(null, cookies[0] || null)
        } else {
          let target = null
          cookies.forEach((cookie) => {
            if (!target || cookie.path.length > target.path.length) {
              target = cookie
            }
          })
          responseCallback(null, target)
        }
      })
  }

  /**
  * Gets a set of cookies
  * @param evt: the event that fired
  * @param [details]: the query details
  * @param responseCallback: executed on completion
  */
  handleGetAllCookies = (evt, [details], responseCallback) => {
    Promise.resolve()
      .then(() => ElectronCookiePromise.getFromPartitions(this._getAllPartitions(), details, true))
      .then((cookies) => {
        responseCallback(null, cookies)
      })
  }

  /**
  * Sets a cookie
  * @param evt: the event that fired
  * @param [details]: the query to build with
  * @param responseCallback: executed on completion
  */
  handleSetCookie = (evt, [details], responseCallback) => {
    const partitionIds = this._getAllPartitions()
    const partialId = this._partiallyModifiedCookieId(details)
    this._partiallyModifiedCookies.push(partialId)
    Promise.resolve()
      .then(() => ElectronCookiePromise.setForPartitions(partitionIds, details))
      .then(() => ElectronCookiePromise.getFromPartitions(partitionIds, details))
      .then((cookies) => {
        this._partiallyModifiedCookies = this._partiallyModifiedCookies.filter((id) => id !== partialId)
        responseCallback(null, cookies[0] || null)
      })
      .catch((err) => {
        this._partiallyModifiedCookies = this._partiallyModifiedCookies.filter((id) => id !== partialId)
        responseCallback(err, null)
      })
  }

  /**
  * Removes a cookie
  * @param evt: the event that fired
  * @param [details]: the query details
  * @param responseCallback: executed on completion
  */
  handleRemoveCookie = (evt, [details], responseCallback) => {
    const partitionIds = this._getAllPartitions()
    let removableCookie
    Promise.resolve()
      .then(() => ElectronCookiePromise.getFromPartitions(partitionIds, { url: details.url, name: details.name }, true))
      .then((cookies) => {
        removableCookie = cookies[0]
        return Promise.resolve()
      })
      .then(() => ElectronCookiePromise.removeForPartitions(partitionIds, details.url, details.name))
      .then(() => {
        responseCallback(null, removableCookie ? {
          url: removableCookie.url,
          name: removableCookie.name
        } : null)
      })
      .catch((err) => {
        responseCallback(err, null)
      })
  }
}

export default CRExtensionCookies
