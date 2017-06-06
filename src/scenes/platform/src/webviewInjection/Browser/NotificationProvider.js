const injector = require('../injector')
const path = require('path')
const fs = require('../../../../app/node_modules/fs-extra')
const pkg = require('../../../../app/package.json')
const AppDirectory = require('../../../../app/node_modules/appdirectory')
const { ipcRenderer } = require('electron')
const {DISALLOWED_HTML5_NOTIFICATION_HOSTS} = require('../../../../app/shared/constants.js')

const appDirectory = new AppDirectory({ appName: pkg.name, useRoaming: true }).userData()
const permissionRecordsPath = path.join(appDirectory, 'notification_permissions.records')
const clientModulePath = path.join(__dirname, './Client/Notification.js')

class NotificationProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    window.addEventListener('message', this.handleWindowMessage.bind(this))
    injector.injectClientModule(clientModulePath, {
      permission: this.currentDomainPermissionSync()
    })
    ipcRenderer.on('browser-notification-click', (evt, data) => {
      window.postMessage(JSON.stringify({
        type: 'wavebox-notification-clicked',
        wavebox: true,
        notificationId: data.notificationId
      }), '*')
    })
  }

  /* **************************************************************************/
  // Permissions
  /* **************************************************************************/

  /**
  * Gets the current domain from the location
  * @return the domain
  */
  _getCurrentDomain () {
    const host = window.location.host.startsWith('www.') ? window.location.host.replace('www.', '') : window.location.host
    return `${window.location.protocol}//${host}`
  }

  /**
  * Parses the domain permission
  * @param data: the data from disk
  * @return the html6 permission option
  */
  _getDomainPermissionFromData (data) {
    const domain = this._getCurrentDomain()
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
  * @return true if this domain is always disablled, false otherwise
  */
  _isCurrentDomainAlwaysDisallowed () {
    const domain = this._getCurrentDomain()
    return !!DISALLOWED_HTML5_NOTIFICATION_HOSTS.find((dis) => domain.indexOf(dis) !== -1)
  }

  /**
  * Checks if the current domain is allowed
  * @return promise with the html5 permission option
  */
  currentDomainPermission () {
    if (this._isCurrentDomainAlwaysDisallowed()) {
      return Promise.resolve('denied')
    } else {
      return Promise.resolve()
        .then(() => fs.readFile(permissionRecordsPath, 'utf8'))
        .then(
          (data) => Promise.resolve(this._getDomainPermissionFromData(data)),
          (_err) => Promise.resolve(this._getDomainPermissionFromData(''))
        )
    }
  }

  /**
  * Checks if the current domain is allowed synchronously
  * @return the html5 permission option
  */
  currentDomainPermissionSync () {
    if (this._isCurrentDomainAlwaysDisallowed()) {
      return 'denied'
    } else {
      let data = ''
      try {
        data = fs.readFileSync(permissionRecordsPath, 'utf8')
      } catch (ex) { /* no-op */ }
      return this._getDomainPermissionFromData(data)
    }
  }

  /**
  * Processes a permission request for the current url
  * @return promise with the html5 permission option
  */
  processPermissionRequest () {
    return Promise.resolve()
      .then(() => this.currentDomainPermission())
      .then((permission) => {
        if (permission !== 'default') { return Promise.resolve(permission) }
        const domain = this._getCurrentDomain()

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
  // Handlers
  /* **************************************************************************/

  /**
  * Handles a new window message
  * @param evt: the event that fired
  */
  handleWindowMessage (evt) {
    if (evt.origin === window.location.origin && evt.isTrusted) {
      let data
      try {
        data = JSON.parse(evt.data)
      } catch (ex) { return }
      if (!data.wavebox) { return }

      if (data.type === 'wavebox-notification-present') {
        this.currentDomainPermission().then((permission) => {
          if (permission === 'granted') {
            ipcRenderer.sendToHost({
              type: 'browser-notification-present',
              notificationId: data.notificationId,
              notification: data.notification
            })
          }
        })
      } else if (data.type === 'wavebox-notification-permission-request') {
        this.processPermissionRequest().then((permission) => {
          window.postMessage(JSON.stringify({
            type: 'wavebox-notification-permission-request-response',
            wavebox: true,
            responseId: data.responseId,
            permission: permission
          }), '*')
        })
      }
    }
  }
}

module.exports = NotificationProvider
