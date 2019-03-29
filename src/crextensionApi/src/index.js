import Chrome from './Chrome'
import ExtensionDatasource from './Core/ExtensionDatasource'
import { CR_RUNTIME_ENVIRONMENTS, CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import BrowserXHRBuilder from './BrowserXHRBuilder'
import WBRPCRenderer from 'shared/WBRPCRenderer'

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
      ? WBRPCRenderer.webContents.getInitialHostUrlSync()
      : window.location.href

    const parsedUrl = new window.URL(currentUrl)
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
    const config = WBRPCRenderer.wavebox.getExtensionHostedPreloadConfigSync(extensionId)
    if (config && config.hasRuntime) {
      const extensionDatasource = new ExtensionDatasource(extensionId, config.runtimeConfig)
      const environment = config.isBackgroundPage
        ? CR_RUNTIME_ENVIRONMENTS.BACKGROUND
        : CR_RUNTIME_ENVIRONMENTS.HOSTED

      window.chrome = new Chrome(extensionId, environment, extensionDatasource)
      window.XMLHttpRequest = BrowserXHRBuilder.buildHostedXMLHttpRequest(window.XMLHttpRequest)
      window.fetch = BrowserXHRBuilder.buildHostedFetch(window.fetch)
    }
  }

  /**
  * Injects the content script loader
  */
  static _injectContentScriptLoader () {
    // Write the start function into the window
    window.contentScriptInit = function (extensionId) {
      delete window.contentScriptInit
      const config = WBRPCRenderer.wavebox.getExtensionContentScriptPreloadConfigSync(extensionId)
      if (config && config.hasRuntime) {
        const extensionDatasource = new ExtensionDatasource(extensionId, config.runtimeConfig)
        window.chrome = new Chrome(extensionId, CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT, extensionDatasource)
        window.XMLHttpRequest = BrowserXHRBuilder.buildContentScriptXMLHttpRequest(
          extensionId,
          extensionDatasource.xhrToken,
          window.XMLHttpRequest
        )
        window.fetch = BrowserXHRBuilder.buildContentScriptFetch(
          extensionId,
          extensionDatasource.xhrToken,
          window.fetch
        )
      }
    }
  }
}

Loader.init()
