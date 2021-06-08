import { ipcMain } from 'electron'
import fs from 'fs-extra'
import { ElectronWebContents } from 'ElectronTools'
import RuntimePaths from 'Runtime/RuntimePaths'
import {
  WB_NOTIFICATION_PERMISSION_SET_SYNC
} from 'shared/ipcEvents'

const privUnloadedPermissionCache = Symbol('privUnloadedPermissionCache')

class NotificationService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privUnloadedPermissionCache] = undefined

    ipcMain.on(WB_NOTIFICATION_PERMISSION_SET_SYNC, this._handleSetNotificationPermissionSync)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get permissionCache () {
    if (this[privUnloadedPermissionCache] === undefined) {
      let raw = ''
      try {
        raw = fs.readFileSync(RuntimePaths.NOTIFICATION_PERMISSION_PATH, 'utf8')
      } catch (ex) { }

      this[privUnloadedPermissionCache] = raw
        .split('\n')
        .reduce((acc, rawLine) => {
          if (rawLine) {
            try {
              const line = JSON.parse(rawLine)
              acc.set(line.domain, line)
            } catch (ex) { }
          }
          return acc
        }, new Map())
    }
    return this[privUnloadedPermissionCache]
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * Gets the domain permission for a webcontents
  * @param wc: the webcontents
  * @param currentUrl: the url as reported by the page
  * @return { domain, permission }
  */
  getDomainPermissionForWebContents (wc, currentUrl) {
    const domain = ElectronWebContents.getPermissionRootUrl(wc, currentUrl)
    if (this.permissionCache.has(domain)) {
      return this.permissionCache.get(domain)
    } else {
      return { domain, permission: 'default' }
    }
  }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Sets the notification permission
  * @param evt: the event that fired
  * @param permission: the permission to set
  */
  _handleSetNotificationPermissionSync = (evt, permission) => {
    try {
      const domain = ElectronWebContents.getPermissionRootUrl(evt.sender)
      if (!this.permissionCache.has(domain)) {
        const payload = { domain: domain, permission: permission, time: new Date().getTime() }
        this.permissionCache.set(domain, payload)
        fs.appendFileSync(RuntimePaths.NOTIFICATION_PERMISSION_PATH, `\n${JSON.stringify(payload)}`)
        evt.returnValue = true
      } else {
        evt.returnValue = false
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WB_NOTIFICATION_PERMISSION_SET_SYNC}" continuing with unkown side effects`, ex)
      evt.returnValue = false
    }
  }
}

export default NotificationService
