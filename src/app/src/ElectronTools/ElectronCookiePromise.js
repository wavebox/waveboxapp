import { session } from 'electron'

class ElectronCookiePromise {
  /* ****************************************************************************/
  // Promise
  /* ****************************************************************************/

  /**
  * Gets the cookies as a promise
  * @param cookies: the cookies instance to get from
  * @param filter: the filter to apply when getting
  * @param suppressError=false: set to true to return an empty array rather than throwing
  * @return promise
  */
  static get (cookies, filter, suppressError = false) {
    return new Promise((resolve, reject) => {
      cookies.get(filter, (err, cookies) => {
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
  * Sets a cookie as a promise
  * @param cookies: the cookies instance to set to
  * @param details: the details of the cookie
  * @return promise
  */
  static set (cookies, details) {
    return new Promise((resolve, reject) => {
      cookies.set(details, (err) => {
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
  * @param cookies: the cookies instance to remove from
  * @param details: the details of the cookie
  * @return promise
  */
  static remove (cookies, url, name) {
    return new Promise((resolve, reject) => {
      cookies.remove(url, name, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /* ****************************************************************************/
  // Promise: Multi cookie
  /* ****************************************************************************/

  /**
  * Sets multiple cookies
  * @param cookies: the cookies instance to set on
  * @param cookieDetails: the cookies to set in the instace
  * @return promise
  */
  static setMultiple (cookies, cookieDetails) {
    let lastError = null
    return Promise.resolve()
      .then(() => {
        return cookieDetails.reduce((acc, details) => {
          return acc
            .then(() => this.set(cookies, details))
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
  // Promise: Multi session
  /* ****************************************************************************/

  /**
  * Gets the cookies as a promise from multiple partitions
  * @param partitionIds: the ids of the partition
  * @param filter: the filter to apply when getting
  * @param suppressError=false: set to true to return an empty array rather than throwing
  * @return promise
  */
  static getFromPartitions (partitionIds, filter, suppressError = false) {
    const sessions = partitionIds.map((partition) => session.fromPartition(partition))
    return this.getFromSessions(sessions, filter, suppressError)
  }

  /**
  * Gets the cookies as a promise from multiple partitions
  * @param sessions: the sessions
  * @param filter: the filter to apply when getting
  * @param suppressError=false: set to true to return an empty array rather than throwing
  * @return promise
  */
  static getFromSessions (sessions, filter, suppressError = false) {
    let allCookies = []
    return Promise.resolve()
      .then(() => {
        return sessions.reduce((acc, ses) => {
          return acc
            .then(() => this.get(ses.cookies, filter, suppressError))
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

  /**
  * Sets a cookie as a promise
  * @param partitionIds: the array of partition ids to set the cookie on
  * @param details: the details of the cookie
  * @return promise
  */
  static setForPartitions (partitionIds, details) {
    const sessions = partitionIds.map((partition) => session.fromPartition(partition))
    return this.setForSessions(sessions, details)
  }

  /**
  * Sets a cookie as a promise
  * @param sessions: the array of sessions to set the cookie on
  * @param details: the details of the cookie
  * @return promise
  */
  static setForSessions (sessions, details) {
    let lastError = null
    return Promise.resolve()
      .then(() => {
        return sessions.reduce((acc, ses) => {
          return acc
            .then(() => this.set(ses.cookies, details))
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

  /**
  * Removes a cookie as a promise
  * @param partitionIds: the array of partition ids to set the cookie on
  * @param details: the details of the cookie
  * @return promise
  */
  static removeForPartitions (partitionIds, url, name) {
    const sessions = partitionIds.map((partition) => session.fromPartition(partition))
    return this.removeForSessions(sessions, url, name)
  }

  /**
  * Removes a cookie as a promise
  * @param sessions: the array of sessions to set the cookie on
  * @param details: the details of the cookie
  * @return promise
  */
  static removeForSessions (sessions, url, name) {
    let lastError = null
    return Promise.resolve()
      .then(() => {
        return sessions.reduce((acc, ses) => {
          return acc
            .then(() => this.remove(ses.cookies, url, name))
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
}

export default ElectronCookiePromise
