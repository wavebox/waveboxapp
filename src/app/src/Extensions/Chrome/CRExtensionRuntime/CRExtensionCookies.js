import { session } from 'electron'
import CRDispatchManager from '../CRDispatchManager'
import mailboxStore from 'stores/mailboxStore'
import {
  CRX_COOKIES_GET_,
  CRX_COOKIES_GET_ALL_,
  CRX_COOKIES_SET_,
  CRX_COOKIES_REMOVE_
} from 'shared/crExtensionIpcEvents'
import CRExtensionBackgroundPage from './CRExtensionBackgroundPage'

class CRExtensionCookies {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension

    if (this.extension.manifest.permissions.has('cookies')) {
      CRDispatchManager.registerHandler(`${CRX_COOKIES_GET_}${this.extension.id}`, this.handleGetCookie)
      CRDispatchManager.registerHandler(`${CRX_COOKIES_GET_ALL_}${this.extension.id}`, this.handleGetAllCookies)
      CRDispatchManager.registerHandler(`${CRX_COOKIES_SET_}${this.extension.id}`, this.handleSetCookie)
      CRDispatchManager.registerHandler(`${CRX_COOKIES_REMOVE_}${this.extension.id}`, this.handleRemoveCookie)
    }
  }

  destroy () {
    CRDispatchManager.unregisterHandler(`${CRX_COOKIES_GET_}${this.extension.id}`, this.handleGetCookie)
    CRDispatchManager.unregisterHandler(`${CRX_COOKIES_GET_ALL_}${this.extension.id}`, this.handleGetAllCookies)
    CRDispatchManager.unregisterHandler(`${CRX_COOKIES_SET_}${this.extension.id}`, this.handleSetCookie)
    CRDispatchManager.unregisterHandler(`${CRX_COOKIES_REMOVE_}${this.extension.id}`, this.handleRemoveCookie)
  }

  /* ****************************************************************************/
  // Utils: Getters
  /* ****************************************************************************/

  /**
  * Gets the cookies as a promise
  * @param partitionId: the id of the partition
  * @param filter: the filter to apply when getting
  * @param suppressError=false: set to true to return an empty array rather than throwing
  * @return promise
  */
  _promiseGetCookies (partitionId, filter, suppressError = false) {
    return new Promise((resolve, reject) => {
      session.fromPartition(partitionId).cookies.get(filter, (err, cookies) => {
        if (err) {
          if (suppressError) {
            resolve([])
          } else {
            reject(err)
          }
        } else {
          resolve(cookies)
        }
      })
    })
  }

  /**
  * Gets the cookies as a promise from multiple partitions
  * @param partitionIds: the ids of the partition
  * @param filter: the filter to apply when getting
  * @param suppressError=false: set to true to return an empty array rather than throwing
  * @return promise
  */
  _promiseGetCookiesFromPartitions (partitionIds, filter, suppressError = false) {
    let allCookies = []
    return Promise.resolve()
      .then(() => {
        return partitionIds.reduce((acc, partition) => {
          return acc
            .then(() => this._promiseGetCookies(partition, filter, suppressError))
            .then((cookies) => {
              allCookies = allCookies.concat(cookies)
              return Promise.resolve()
            })
        }, Promise.resolve())
      })
      .then(() => {
        return Promise.resolve(allCookies)
      })
  }

  /* ****************************************************************************/
  // Utils: Setters
  /* ****************************************************************************/

  /**
  * Sets a cookie as a promise
  * @param partitionId: the id of the partition
  * @param details: the details of the cookie
  * @return promise
  */
  _promiseSetCookie (partitionId, details) {
    return new Promise((resolve, reject) => {
      session.fromPartition(partitionId).cookies.set(details, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
  * Sets a cookie as a promise
  * @param partitionIds: the array of partition ids to set the cookie on
  * @param details: the details of the cookie
  * @return promise
  */
  _promiseSetCookiesForPartitions (partitionIds, details) {
    let lastError = null
    return Promise.resolve()
      .then(() => {
        return partitionIds.reduce((acc, partition) => {
          return acc
            .then(() => this._promiseSetCookie(partition, details))
            .catch((err) => {
              lastError = err
              return Promise.resolve()
            })
        }, Promise.resolve())
      })
      .then(() => {
        if (lastError) {
          return Promise.reject(lastError)
        } else {
          return Promise.resolve()
        }
      })
  }

  /* ****************************************************************************/
  // Utils: Removal
  /* ****************************************************************************/

  /**
  * Removes a cookie as a promise
  * @param partitionId: the id of the partition
  * @param details: the details of the cookie
  * @return promise
  */
  _promiseRemoveCookie (partitionId, url, name) {
    return new Promise((resolve, reject) => {
      session.fromPartition(partitionId).cookies.remove(url, name, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
  * Removes a cookie as a promise
  * @param partitionIds: the array of partition ids to set the cookie on
  * @param details: the details of the cookie
  * @return promise
  */
  _promiseRemoveCookieForPartitions (partitionIds, url, name) {
    let lastError = null
    return Promise.resolve()
      .then(() => {
        return partitionIds.reduce((acc, partition) => {
          return acc
            .then(() => this._promiseRemoveCookie(partition, url, name))
            .catch((err) => {
              lastError = err
              return Promise.resolve()
            })
        }, Promise.resolve())
      })
      .then(() => {
        if (lastError) {
          return Promise.reject(lastError)
        } else {
          return Promise.resolve()
        }
      })
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @return all the partitions that are currently relevant
  */
  _getAllPartitions () {
    return [].concat(
      [CRExtensionBackgroundPage.partitionIdForExtension(this.extension.id)],
      mailboxStore.getMailboxIds().map((mailboxId) => `persist:${mailboxId}`)
    )
  }

  /* ****************************************************************************/
  // Handlers
  /* ****************************************************************************/

  /**
  * Gets a single cookie
  * @param evt: the event that fired
  * @param [details]: the query details
  * @param responseCallback: executed on completion
  */
  handleGetCookie = (evt, [details], responseCallback) => {
    Promise.resolve()
      .then(() => this._promiseGetCookiesFromPartitions(this._getAllPartitions(), { url: details.url, name: details.name }, true))
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
      .then(() => this._promiseGetCookiesFromPartitions(this._getAllPartitions(), details, true))
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
    Promise.resolve()
      .then(() => this._promiseSetCookiesForPartitions(partitionIds, details))
      .then(() => this._promiseGetCookiesFromPartitions(partitionIds, details))
      .then((cookies) => {
        responseCallback(null, cookies[0] || null)
      })
      .catch((err) => {
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
      .then(() => this._promiseGetCookiesFromPartitions(partitionIds, { url: details.url, name: details.name }, true))
      .then((cookies) => {
        removableCookie = cookies[0]
        return Promise.resolve()
      })
      .then(() => this._promiseRemoveCookieForPartitions(partitionIds, details.url, details.name))
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
