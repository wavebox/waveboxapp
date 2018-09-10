import Chrome from './Chrome'
import { URL } from 'whatwg-url'
import { ipcRenderer } from 'electronCrx'
import ExtensionDatasource from './Core/ExtensionDatasource'
import { CR_RUNTIME_ENVIRONMENTS, CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import XMLHttpRequestBuilder from './XMLHttpRequestBuilder'
import {
  WCRPC_SYNC_GET_INITIAL_HOST_URL,
  WCRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG,
  WCRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG
} from 'shared/webContentsRPC'

class Loader {
  /* **************************************************************************/
  // Startup
  /* **************************************************************************/

  static init () {
    // If we load up as about:blank we can be in a few different cases.
    // Case 1:
    //      We actually loaded as about blank and the opener is going to write into us. In which case
    //      should prep to be a content-script
    // Case 2:
    //      We're opened up as popup window (potentially from a background page). In this case we don't
    //      know this yet, but can wait for did-navigate to figure out where we are
    // If we're about:blank we can infer the hostname and protocol from the host url rather than our current url
    const currentUrl = !window.location.href || window.location.href === 'about:blank'
      ? ipcRenderer.sendSync(WCRPC_SYNC_GET_INITIAL_HOST_URL)
      : window.location.href

    const parsedUrl = new URL(currentUrl)
    if (parsedUrl.protocol === `${CR_EXTENSION_PROTOCOL}:`) {
      this._injectExtensionPage(parsedUrl.hostname)
    } else {
      this._injectContentScriptLoader()
    }
  }

  /**
  * Injects the extension page
  * @param extensionId: the id of the extension to inject
  */
  static _injectExtensionPage (extensionId) {
    const config = ipcRenderer.sendSync(WCRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG, extensionId)
    if (config && config.hasRuntime) {
      const extensionDatasource = new ExtensionDatasource(extensionId, config.runtimeConfig)
      const environment = config.isBackgroundPage
        ? CR_RUNTIME_ENVIRONMENTS.BACKGROUND
        : CR_RUNTIME_ENVIRONMENTS.HOSTED

      window.chrome = new Chrome(extensionId, environment, extensionDatasource)
      window.XMLHttpRequest = XMLHttpRequestBuilder.buildHostedXMLHttpRequest(window.XMLHttpRequest)
    }
  }

  /**
  * Injects the content script loader
  */
  static _injectContentScriptLoader () {
    // Write the start function into the window
    window.contentScriptInit = function (extensionId) {
      delete window.contentScriptInit
      const config = ipcRenderer.sendSync(WCRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG, extensionId)
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

Loader.init()
