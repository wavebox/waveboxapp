const url = require('url')
const {DISALLOWED_HTML5_NOTIFICATION_HOSTS} = require('../../shared/constants.js')
const pkg = require('../../package.json')
const path = require('path')
const fs = require('fs-extra')
const AppDirectory = require('appdirectory')

const appDirectory = new AppDirectory({ appName: pkg.name, useRoaming: true }).userData()
const permissionRecordsPath = path.join(appDirectory, 'notification_permissions.records')

/**
* Can be accessed from main and rendering thread
*/
class NotificationPermissionManager {
  /* **************************************************************************/
  // Permissions
  /* **************************************************************************/

  /**
  * Checks if the current domain is allowed
  * @param url: the url that made the request
  * @return promise with the html5 permission option
  */
  static getDomainPermission (url) {
    const domain = this._getDomainFromUrl(url)
    if (this._isDomainAlwaysDisallowed(domain)) {
      return Promise.resolve('denied')
    } else {
      return Promise.resolve()
        .then(() => fs.readFile(permissionRecordsPath, 'utf8'))
        .then(
          (data) => Promise.resolve(this._getDomainPermissionFromData(domain, data)),
          (_err) => Promise.resolve(this._getDomainPermissionFromData(domain, ''))
        )
    }
  }

  /**
  * Gets all the domain permissions parsed as a dict by domain
  * @return promise
  */
  static getAllDomainPermissions () {
    return Promise.resolve()
      .then(() => fs.readFile(permissionRecordsPath, 'utf8'))
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
  static processPermissionRequest (url) {
    const domain = this._getDomainFromUrl(url)
    return Promise.resolve()
      .then(() => this.getDomainPermission(url))
      .then((permission) => {
        if (permission !== 'default') { return Promise.resolve(permission) }

        const permissionData = '\n' + JSON.stringify({ domain: domain, permission: 'granted', time: new Date().getTime() })

        return Promise.resolve()
          .then(() => fs.appendFile(permissionRecordsPath, permissionData))
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
  static _getDomainFromUrl (u) {
    const purl = url.parse(u)
    const host = purl.host.startsWith('www.') ? purl.host.replace('www.', '') : purl.host
    return `${purl.protocol}//${host}`
  }

  /**
  * Parses the domain permission
  * @param data: the data from disk
  * @param domain: the domain
  * @return the html6 permission option
  */
  static _getDomainPermissionFromData (domain, data) {
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
  static _isDomainAlwaysDisallowed (domain) {
    return !!DISALLOWED_HTML5_NOTIFICATION_HOSTS.find((dis) => domain.indexOf(dis) !== -1)
  }
}

module.exports = NotificationPermissionManager
