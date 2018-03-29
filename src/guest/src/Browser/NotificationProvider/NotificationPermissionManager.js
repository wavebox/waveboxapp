import { ipcRenderer } from 'electron'
import { URL } from 'whatwg-url'
import {
  DISALLOWED_HTML5_NOTIFICATION_HOSTS,
  ALLOWED_HTML5_NOTIFICATION_HOSTS
} from 'shared/constants'
import {
  WB_NOTIFICATION_PERMISSION_SET_SYNC
} from 'shared/ipcEvents'
import LiveConfig from 'LiveConfig'

const privRequestedPermission = Symbol('privRequestedPermission')

class NotificationPermissionManager {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privRequestedPermission] = undefined
  }

  /* **************************************************************************/
  // Permissions
  /* **************************************************************************/

  /**
  * Gets the domain permission
  * @return the html5 permission option
  */
  getDomainPermission () {
    if (this[privRequestedPermission] !== undefined) {
      return this[privRequestedPermission]
    }
    const domain = LiveConfig.permissionRootUrl
    if (this._isDomainAlwaysDisallowed(domain)) {
      return 'denied'
    } else if (this._isDomainAlwaysAllowed(domain)) {
      return 'granted'
    } else {
      return LiveConfig.notificationPermission.permission
    }
  }

  /**
  * Processes a permission request for the current url
  * @return the new permission
  */
  processPermissionRequest () {
    if (this.getDomainPermission() !== 'default') { return this.getDomainPermission() }

    const changed = ipcRenderer.sendSync(WB_NOTIFICATION_PERMISSION_SET_SYNC, 'granted')
    if (changed) {
      this[privRequestedPermission] = 'granted'
    }
    return this.getDomainPermission()
  }

  /* **************************************************************************/
  // Permission Utils
  /* **************************************************************************/

  /**
  * Gets the protocol from the given url
  * @param u: the url to get the sanitized protocol from
  * @return a sanitized version of the protocl such as http:
  */
  _getProtocolFromUrl (u) {
    const purl = new URL(u)
    return purl.protocol
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
}

export default NotificationPermissionManager
