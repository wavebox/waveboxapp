import Chrome from './Chrome'
import { URL } from 'whatwg-url'
import { ipcRenderer } from 'electron'
import ExtensionDatasource from './Core/ExtensionDatasource'
import { CR_RUNTIME_ENVIRONMENTS, CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import { WCRPC_SYNC_GET_EXTENSION_PRELOAD_CONFIG } from 'shared/webContentsRPC'
import XMLHttpRequestBuilder from './XMLHttpRequestBuilder'

class Loader {
  /* **************************************************************************/
  // Startup
  /* **************************************************************************/

  static init () {
    const parsedUrl = new URL(window.location.href)
    if (parsedUrl.protocol === `${CR_EXTENSION_PROTOCOL}:`) {
      const config = ipcRenderer.sendSync(WCRPC_SYNC_GET_EXTENSION_PRELOAD_CONFIG, parsedUrl.hostname)
      if (config && config.hasRuntime) {
        const extensionId = parsedUrl.hostname
        const extensionDatasource = new ExtensionDatasource(extensionId, config.runtimeConfig)
        if (config.isBackgroundPage) {
          window.chrome = new Chrome(parsedUrl.hostname, CR_RUNTIME_ENVIRONMENTS.BACKGROUND, extensionDatasource)
        } else {
          window.chrome = new Chrome(parsedUrl.hostname, CR_RUNTIME_ENVIRONMENTS.HOSTED, extensionDatasource)
        }
      }
    } else {
      // Write the start function into the window
      window.contentScriptInit = function (extensionId) {
        delete window.contentScriptInit
        const config = ipcRenderer.sendSync(WCRPC_SYNC_GET_EXTENSION_PRELOAD_CONFIG, extensionId)
        if (config && config.hasRuntime) {
          const extensionDatasource = new ExtensionDatasource(extensionId, config.runtimeConfig)
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
