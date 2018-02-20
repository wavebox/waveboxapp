import { ipcRenderer, webFrame } from 'electron'
import { CRExtensionMatchPatterns } from 'shared/Models/CRExtension'
import { WBECRX_EXECUTE_SCRIPT } from 'shared/ipcEvents'
import GuestHost from '../GuestHost'
import DispatchManager from 'DispatchManager'
import { RENDER_PROCESS_PREFERENCE_TYPES } from 'shared/processPreferences'
import { WCRPC_DOM_READY } from 'shared/webContentsRPC'
import Resolver from 'Runtime/Resolver'

const privHasLoaded = Symbol('privHasLoaded')
const privContexts = Symbol('privContexts')
const privExtensionPreferences = Symbol('privExtensionPreferences')

class CRExtensionLoader {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privHasLoaded] = false
    this[privContexts] = new Map()
    this[privExtensionPreferences] = new Map()

    DispatchManager.registerHandler(WBECRX_EXECUTE_SCRIPT, this._handleCRXExecuteScript)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isContextlessDocument () {
    return window.location.href === 'about:blank'
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Loads the extension
  */
  load () {
    if (this[privHasLoaded]) { return }
    this[privHasLoaded] = true

    const hostUrl = GuestHost.parsedUrl
    if (hostUrl.protocol === 'http:' || hostUrl.protocol === 'https:') {
      this[privExtensionPreferences] = Array.from(process.getRenderProcessPreferences() || [])
        .reduce((acc, pref) => {
          if (pref.type === RENDER_PROCESS_PREFERENCE_TYPES.WB_CREXTENSION_CONTENTSCRIPT_CONFIG) {
            acc.set(pref.extensionId, pref)
          }
          return acc
        }, new Map())

      Array.from(this[privExtensionPreferences].values()).forEach((pref) => {
        if (pref.crExtensionContentScripts) {
          this._initializeExtensionContentScript(hostUrl.protocol, hostUrl.hostname, hostUrl.pathname, pref.extensionId, pref.crExtensionContentScripts)
        }
      })
    }
  }

  /* **************************************************************************/
  // Content Scripts
  /* **************************************************************************/

  /**
  * Gets or creates a context for a script
  * @param extensionId: the id of the extension
  * @return the id of the created context
  */
  _getOrCreateContextForScript (extensionId) {
    if (!this[privContexts].has(extensionId)) {
      const contextId = webFrame.createContext(extensionId, JSON.stringify({
        preload: Resolver.crextensionApi(),
        crExtensionCSAutoInit: true,
        crExtensionCSExtensionId: extensionId,
        crExtensionCSGuestHost: GuestHost.url
      }))
      this[privContexts].set(extensionId, contextId)
      return contextId
    } else {
      return this[privContexts].get(extensionId)
    }
  }

  /* **************************************************************************/
  // Loading: Content Scripts
  /* **************************************************************************/

  /**
  * Starts an extension in the current page
  * @param protocol: the host protocl
  * @param hostname: the host hostname
  * @param pathname: the host pathname
  * @param extensionId: the id of the extension to inject
  * @param contentScripts: the configuration for the content scripts
  */
  _initializeExtensionContentScript (protocol, hostname, pathname, extensionId, contentScripts) {
    if (!webFrame.createContext) { return }

    const matchedContentScripts = (contentScripts || []).filter((cs) => {
      return CRExtensionMatchPatterns.matchUrls(protocol, hostname, pathname, cs.matches)
    })

    if (matchedContentScripts.length) {
      const contextId = this._getOrCreateContextForScript(extensionId)
      matchedContentScripts.forEach(({js, css, runAt}) => {
        if (js && js.length) {
          this._injectContentJavaScript(contextId, extensionId, js, runAt)
        }
        if (css && css.length) {
          this._injectContentStyle(extensionId, css, runAt)
        }
      })
    }
  }

  /**
  * Injects a content script
  * @param contextId: the id of the in-use context
  * @param extensionId: the id of the extension
  * @param js: the array of js code to run
  * @param runAt: the point to run the scripts at
  */
  _injectContentJavaScript (contextId, extensionId, js, runAt) {
    js.forEach(({url, code}) => {
      const execute = this._executeContentJavaScript.bind(window, contextId, extensionId, url, code)

      if (runAt === 'document_start') {
        setTimeout(execute)
      } else if (runAt === 'document_end') {
        if (this.isContextlessDocument) {
          ipcRenderer.once(WCRPC_DOM_READY, execute)
        } else {
          document.addEventListener('DOMContentLoaded', execute)
        }
      } else if (runAt === 'document_idle') {
        ipcRenderer.once(WCRPC_DOM_READY, execute)
      }
    })
  }

  /**
  * Executes the content script
  * @param contextId: the id of the context
  * @param extensionId: the id of the extension to inject
  * @param url: the url of the code
  * @param code: the code to inject
  */
  _executeContentJavaScript (contextId, extensionId, url, code) {
    webFrame.executeContextScript(contextId, code)
  }

  /**
  * Injects a css script
  * @param extensionId: the id of the extension
  * @param css: the array of css code to run
  * @param runAt: the point to run the scripts at
  */
  _injectContentStyle (extensionId, css, runAt) {
    css.forEach(({url, code}) => {
      const execute = this._executeContentStyle.bind(window, extensionId, url, code)

      if (runAt === 'document_start') {
        setTimeout(execute)
      } else if (runAt === 'document_end') {
        if (this.isContextlessDocument) {
          ipcRenderer.once(WCRPC_DOM_READY, execute)
        } else {
          document.addEventListener('DOMContentLoaded', execute)
        }
      } else if (runAt === 'document_idle') {
        ipcRenderer.once(WCRPC_DOM_READY, execute)
      }
    })
  }

  /**
  * Executes the content style script
  * @param extensionId: the id of the extension to inject
  * @param url: the url of the code
  * @param code: the code to inject
  */
  _executeContentStyle (extensionId, url, code) {
    webFrame.insertCSS(code)
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  /**
  * Executes a script on behalf of an extension
  * @param evt: the event that fired
  * @param [extensionId, details, format, code]: the extension id requesting and details
  * @param responseCallback: the response callback to reply with
  */
  _handleCRXExecuteScript = (evt, [extensionId, details, format, code], responseCallback) => {
    if (format === '.js') {
      const contextId = this._getOrCreateContextForScript(extensionId)
      webFrame.executeContextScript(contextId, code, (res) => {
        responseCallback(null, [res])
      })
    } else if (format === '.css') {
      webFrame.insertCSS(code)
      responseCallback(null, [])
    } else {
      responseCallback(new Error(`Unable to load unknown format "${format}"`))
    }
  }
}

export default CRExtensionLoader
