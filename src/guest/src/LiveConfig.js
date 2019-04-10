import WBRPCRenderer from 'shared/WBRPCRenderer'

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
      this[privConfig] = Object.freeze(WBRPCRenderer.wavebox.getGuestPreloadConfigSync())
    }
    return this[privConfig]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get launchSettings () { return this.config.launchSettings }
  get launchUserSettings () { return this.config.launchUserSettings }
  get extensions () { return this.config.extensions }
  get permissionRootUrl () {
    const purl = new window.URL(this.hostUrl || 'about:blank')
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
  get arch () { return this.config.arch }
  get osRelease () { return this.config.osRelease }
  get iEngine () { return this.config.iEngine }
  get hasIEngine () { return !!this.iEngine }
}

export default new LiveConfig()
