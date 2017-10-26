import Chrome from './Chrome'
import url from 'url'
import { ipcRenderer } from 'electronCrx'
import { CRX_RUNTIME_HAS_RESPONDER } from 'shared/crExtensionIpcEvents'
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
    return process.context_args !== undefined && process.context_args.crExtensionCSAutoInit === true
  }

  /* **************************************************************************/
  // Startup
  /* **************************************************************************/

  static init () {
    const parsedUrl = url.parse(window.location.href)
    if (parsedUrl.protocol === `${CR_EXTENSION_PROTOCOL}:`) {
      const hasResponder = ipcRenderer.sendSync(CRX_RUNTIME_HAS_RESPONDER, parsedUrl.hostname)
      if (hasResponder) {
        if (this.isBackgroundPage) {
          window.chrome = new Chrome(parsedUrl.hostname, CR_RUNTIME_ENVIRONMENTS.BACKGROUND)
        } else {
          window.chrome = new Chrome(parsedUrl.hostname, CR_RUNTIME_ENVIRONMENTS.HOSTED)
        }
      }
    } else {
      if (this.isContentScript) {
        const hasResponder = ipcRenderer.sendSync(CRX_RUNTIME_HAS_RESPONDER, process.context_args.crExtensionCSExtensionId)
        if (hasResponder) {
          window.chrome = new Chrome(process.context_args.crExtensionCSExtensionId, CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT)
        }
      }
    }
  }
}

Loader.init()
