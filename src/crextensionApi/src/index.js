import Chrome from './Chrome'
import url from 'url'
import electron from 'electron'
import {
  CR_RUNTIME_ENVIRONMENTS,
  CR_EXTENSION_PROTOCOL
} from 'shared/extensionApis'

class Loader {
  /* **************************************************************************/
  // Class Properties
  /* **************************************************************************/

  static get isBackgroundPage () {
    return process.argv.findIndex((arg) => arg === '--background-page') !== -1
  }

  static get isContentScript () {
    return process.context_args && process.context_args.crExtensionCSAutoInit
  }

  static get guestHostUrl () {
    if (window.location.href === 'about:blank') {
      if (window.opener && window.opener.location.href) {
        const webPreferences = electron.remote.getCurrentWebContents().getWebPreferences()
        if (webPreferences.openerId !== undefined) {
          const openerWebContents = electron.remote.webContents.fromId(webPreferences.openerId)
          if (openerWebContents) {
            if (openerWebContents.getURL() === window.opener.location.href) {
              return url.parse(window.opener.location.href)
            }
          }
        }
      }
    }
    return url.parse(window.location.href)
  }

  /* **************************************************************************/
  // Startup
  /* **************************************************************************/

  static init () {
    const hostUrl = this.guestHostUrl
    if (hostUrl.protocol === `${CR_EXTENSION_PROTOCOL}:`) {
      if (this.isBackgroundPage) {
        window.chrome = new Chrome(hostUrl.hostname, CR_RUNTIME_ENVIRONMENTS.BACKGROUND)
      } else {
        window.chrome = new Chrome(hostUrl.hostname, CR_RUNTIME_ENVIRONMENTS.HOSTED)
      }
    } else {
      if (this.isContentScript) {
        window.chrome = new Chrome(process.context_args.crExtensionCSExtensionId, CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT)
      }
    }
  }
}

Loader.init()
