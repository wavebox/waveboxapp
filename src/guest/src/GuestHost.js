const electron = require('electron')
const url = require('url')

class GuestHost {
  static get url () {
    if (window.location.href === 'about:blank') {
      if (window.opener && window.opener.location.href) {
        const webPreferences = electron.remote.getCurrentWebContents().getWebPreferences()
        if (webPreferences.openerId !== undefined) {
          const openerWebContents = electron.remote.webContents.fromId(webPreferences.openerId)
          if (openerWebContents) {
            if (openerWebContents.getURL() === window.opener.location.href) {
              return window.opener.location.href
            }
          }
        }
      }
    }
    return window.location.href
  }

  static get parsedUrl () {
    const u = this.url
    return u ? url.parse(u) : undefined
  }
}

module.exports = GuestHost
