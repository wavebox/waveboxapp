import url from 'url'
import fs from 'fs'
import {
  DISALLOWED_HTML5_NOTIFICATION_HOSTS,
  ALLOWED_HTML5_NOTIFICATION_HOSTS
} from 'shared/constants'
import {
  WAVEBOX_HOSTED_EXTENSION_PROTOCOL
} from 'shared/extensionApis'

/**
* Can be accessed from main and rendering thread
*/
class NotificationPermissionManager {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param notificationPermissionPath: the path to the notification permissions
  */
  constructor (notificationPermissionPath) {
    this.notificationPermissionPath = notificationPermissionPath
  }

  /* **************************************************************************/
  // Permissions
  /* **************************************************************************/

  /**
  * Checks if the current domain is allowed
  * @param url: the url that made the request
  * @return promise with the html5 permission option
  */
  getDomainPermission (url) {
    const domain = this._getDomainFromUrl(url)
    if (this._isDomainAlwaysDisallowed(domain)) {
      return Promise.resolve('denied')
    } else if (this._isDomainAlwaysAllowed(domain)) {
      return Promise.resolve('granted')
    } else if (this._isProtocolAlwaysAllowed(this._getProtocolFromUrl(url))) {
      return Promise.resolve('granted')
    } else {
      return Promise.resolve()
        .then(() => {
          return new Promise((resolve, reject) => {
            fs.readFile(this.notificationPermissionPath, 'utf8', (err, data) => {
              if (err) {
                reject(err)
              } else {
                resolve(data)
              }
            })
          })
        })
        .then(
          (data) => Promise.resolve(this._getDomainPermissionFromData(domain, data)),
          (_err) => Promise.resolve(this._getDomainPermissionFromData(domain, ''))
        )
    }
  }

  /**
  * Gets the domain permission synchronously
  * @param url: the url that made the request
  * @return the html5 permission option
  */
  getDomainPermissionSync (url) {
    const domain = this._getDomainFromUrl(url)
    if (this._isDomainAlwaysDisallowed(domain)) {
      return 'denied'
    } else if (this._isDomainAlwaysAllowed(domain)) {
      return 'granted'
    } else if (this._isProtocolAlwaysAllowed(this._getProtocolFromUrl(url))) {
      return 'granted'
    } else {
      try {
        const data = fs.readFileSync(this.notificationPermissionPath, 'utf8')
        return this._getDomainPermissionFromData(domain, data)
      } catch (ex) {
        return this._getDomainPermissionFromData(domain, '')
      }
    }
  }

  /**
  * Gets all the domain permissions parsed as a dict by domain
  * @return promise
  */
  getAllDomainPermissions () {
    return Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          fs.readFile(this.notificationPermissionPath, 'utf8', (err, data) => {
            if (err) {
              reject(err)
            } else {
              resolve(data)
            }
          })
        })
      })
      .then(
        (data) => {
          const parsedData = data.split('\n').reduce((acc, rawInfo) => {
            if (rawInfo) {
              try {
                const info = JSON.parse(rawInfo)
                acc[info.domain] = info
              } catch (ex) { }
            }
            return acc
          }, {})
          return Promise.resolve(parsedData)
        }
      ).catch(() => Promise.resolve({}))
  }

  /**
  * Processes a permission request for the current url
  * @param url: the url that made the request
  * @return promise with the html5 permission option
  */
  processPermissionRequest (url) {
    const domain = this._getDomainFromUrl(url)
    return Promise.resolve()
      .then(() => this.getDomainPermission(url))
      .then((permission) => {
        if (permission !== 'default') { return Promise.resolve(permission) }

        const permissionData = '\n' + JSON.stringify({ domain: domain, permission: 'granted', time: new Date().getTime() })

        return Promise.resolve()
          .then(() => {
            return new Promise((resolve, reject) => {
              fs.appendFile(this.notificationPermissionPath, permissionData, (err, data) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(data)
                }
              })
            })
          })
          .then(
            () => Promise.resolve('granted'),
            () => Promise.resolve('default')
          )
      })
  }

  /* **************************************************************************/
  // Permission Utils
  /* **************************************************************************/

  /**
  * Gets the domain from the given url
  * @param u: the url to get the sanitized domain from
  * @return a sanitized version of the domain
  */
  _getDomainFromUrl (u) {
    const purl = url.parse(u)
    const host = purl.host.startsWith('www.') ? purl.host.replace('www.', '') : purl.host
    return `${purl.protocol}//${host}`
  }

  /**
  * Gets the protocol from the given url
  * @param u: the url to get the sanitized protocol from
  * @return a sanitized version of the protocl such as http:
  */
  _getProtocolFromUrl (u) {
    const purl = url.parse(u)
    return purl.protocol
  }

  /**
  * Parses the domain permission
  * @param data: the data from disk
  * @param domain: the domain
  * @return the html6 permission option
  */
  _getDomainPermissionFromData (domain, data) {
    const permissionInfo = data.split('\n').find((p) => p.indexOf(`"${domain}"`) !== -1)
    if (permissionInfo) {
      try {
        return JSON.parse(permissionInfo).permission || 'default'
      } catch (ex) {
        return 'default'
      }
    } else {
      return 'default'
    }
  }

  /**
  * @param domain: the domain to query for
  * @return true if this domain is always disablled, false otherwise
  */
  _isDomainAlwaysDisallowed (domain) {
    return !!DISALLOWED_HTML5_NOTIFICATION_HOSTS.find((dis) => domain.indexOf(dis) !== -1)
  }

  /**
  * @param domain: the domain to query for
  * @return true if this domain is always allowed, false otherwise
  */
  _isDomainAlwaysAllowed (domain) {
    return !!ALLOWED_HTML5_NOTIFICATION_HOSTS.find((all) => domain.indexOf(all) !== -1)
  }

  /**
  * @param protocol: the protocol to query for in the format http:
  * @return true if this domain is always allowed, false otherwise
  */
  _isProtocolAlwaysAllowed (protocol) {
    return protocol === WAVEBOX_HOSTED_EXTENSION_PROTOCOL + ':'
  }
}

export default NotificationPermissionManager
