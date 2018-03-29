import { ipcRenderer } from 'electron'
import { WCRPC_SYNC_GET_GUEST_PRELOAD_CONFIG } from 'shared/webContentsRPC'
import { URL } from 'whatwg-url'

const privConfig = Symbol('privConfig')

class LiveConfig {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privConfig] = null
  }

  /* **************************************************************************/
  // Properties: Low level
  /* **************************************************************************/

  get config () {
    if (this[privConfig] === null) {
      this[privConfig] = Object.freeze(ipcRenderer.sendSync(WCRPC_SYNC_GET_GUEST_PRELOAD_CONFIG, window.location.href))
    }
    return this[privConfig]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get launchSettings () { return this.config.launchSettings }
  get extensions () { return this.config.extensions }
  get permissionRootUrl () {
    const purl = new URL(this.hostUrl || 'about:blank')
    const host = purl.host.startsWith('www.') ? purl.host.replace('www.', '') : purl.host
    return `${purl.protocol}//${host}`
  }
  get hostUrl () {
    if (window.location.href === 'about:blank') {
      return this.config.initialHostUrl
    } else {
      return window.location.href
    }
  }
  get notificationPermission () { return this.config.notificationPermission }
  get paths () { return this.config.paths }
  get platform () { return this.config.platform }
}

export default new LiveConfig()
