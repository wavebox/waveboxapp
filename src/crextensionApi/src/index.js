import Chrome from './Chrome'
import url from 'url'
import { ipcRenderer } from 'electronCrx'
import { CRX_RUNTIME_HAS_RESPONDER } from 'shared/crExtensionIpcEvents'
import ExtensionDatasource from './Core/ExtensionDatasource'
import { CR_RUNTIME_ENVIRONMENTS, CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import XMLHttpRequestBuilder from './XMLHttpRequestBuilder'

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
        const extensionId = parsedUrl.hostname
        const extensionDatasource = new ExtensionDatasource(extensionId)
        if (this.isBackgroundPage) {
          window.chrome = new Chrome(parsedUrl.hostname, CR_RUNTIME_ENVIRONMENTS.BACKGROUND, extensionDatasource)
        } else {
          window.chrome = new Chrome(parsedUrl.hostname, CR_RUNTIME_ENVIRONMENTS.HOSTED, extensionDatasource)
        }
      }
    } else {
      if (this.isContentScript) {
        const hasResponder = ipcRenderer.sendSync(CRX_RUNTIME_HAS_RESPONDER, process.context_args.crExtensionCSExtensionId)
        if (hasResponder) {
          const extensionId = process.context_args.crExtensionCSExtensionId
          const extensionDatasource = new ExtensionDatasource(extensionId)
          window.chrome = new Chrome(extensionId, CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT, extensionDatasource)
          window.XMLHttpRequest = XMLHttpRequestBuilder.buildContentScriptXMLHttpRequest(
            extensionId,
            extensionDatasource.xhrToken,
            window.XMLHttpRequest
          )
        }
      }
    }
  }
}

Loader.init()
