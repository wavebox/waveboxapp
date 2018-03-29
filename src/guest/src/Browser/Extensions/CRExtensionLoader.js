import { webFrame } from 'electron'
import { CRExtensionMatchPatterns } from 'shared/Models/CRExtension'
import { WBECRX_EXECUTE_SCRIPT } from 'shared/ipcEvents'
import DispatchManager from 'DispatchManager'
import LiveConfig from 'LiveConfig'
import { URL } from 'whatwg-url'
import CRExtensionRunEvents from './CRExtensionRunEvents'

const SUPPORTED_CONTENT_SCRIPT_PROTOCOLS = new Set([
  'http:',
  'https:'
])

const privHasLoaded = Symbol('privHasLoaded')
const privContexts = Symbol('privContexts')
const privExtensionPreferences = Symbol('privExtensionPreferences')
const privRunEvents = Symbol('privRunEvents')

class CRExtensionLoader {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privHasLoaded] = false
    this[privContexts] = new Map()
    this[privExtensionPreferences] = new Map()
    this[privRunEvents] = new CRExtensionRunEvents()

    DispatchManager.registerHandler(WBECRX_EXECUTE_SCRIPT, this._handleCRXExecuteScript)
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

    // If we're loading into about:blank we need to get the parent url
    // so we can setup correctly.
    const hostUrl = new URL(LiveConfig.hostUrl)
    if (SUPPORTED_CONTENT_SCRIPT_PROTOCOLS.has(hostUrl.protocol)) {
      this[privExtensionPreferences] = LiveConfig.extensions
        .reduce((acc, pref) => {
          acc.set(pref.extensionId, pref)
          return acc
        }, new Map())

      Array.from(this[privExtensionPreferences].values()).forEach((pref) => {
        this._provisionContext(
          pref.extensionId,
          `${hostUrl.protocol}//${hostUrl.host}`,
          pref.contentSecurityPolicy
        )
        if (pref.crExtensionContentScripts) {
          this._initializeExtensionContentScript(
            hostUrl.protocol,
            hostUrl.hostname,
            hostUrl.pathname,
            pref.extensionId,
            pref.crExtensionContentScripts
          )
        }
      })
    }
  }

  /* **************************************************************************/
  // Content Scripts
  /* **************************************************************************/

  /**
  * Initializes the context framework. Doesn't create the context just stores the
  * data for creation later
  * @param extensionId: the id of the extension
  * @param securityOrgin: the security origin of the extension
  * @param contentSecurityPolicy: the csp of the extension
  */
  _provisionContext (extensionId, securityOrigin, contentSecurityPolicy) {
    if (!this[privContexts].has(extensionId)) {
      this[privContexts].set(extensionId, {
        extensionId: extensionId,
        securityOrgin: securityOrigin,
        contentSecurityPolicy: contentSecurityPolicy,
        contextId: undefined
      })
    }
  }

  /**
  * Gets or creates a context for a script. If the script has not been provisioned throws an exception
  * @param extensionId: the id of the extension
  * @return the id of the created context
  */
  _getOrCreateContextForScript (extensionId) {
    if (!this[privContexts].has(extensionId) || !webFrame.createContextId) {
      throw new Error(`Context has not been provisioned for extension "${extensionId}"`)
    }

    const provisioned = this[privContexts].get(extensionId)
    if (provisioned.contextId !== undefined) {
      return provisioned.contextId
    } else {
      const contextId = webFrame.createContextId()
      webFrame.setIsolatedWorldHumanReadableName(contextId, extensionId)
      webFrame.setIsolatedWorldSecurityOrigin(contextId, provisioned.securityOrgin)
      webFrame.setIsolatedWorldContentSecurityPolicy(contextId, provisioned.contentSecurityPolicy)
      webFrame.executeJavaScriptInIsolatedWorld(contextId, [
        { code: `;(() => { window.contentScriptInit("${extensionId}") })();` }
      ])
      this[privContexts].set(extensionId, {
        ...provisioned,
        contextId: contextId
      })
      return contextId
    }
  }

  /**
  * Gets a context for a script
  * @param extensionId: the id of the extension
  * @return the id of the context or undefined
  */
  _getContextForScript (extensionId) {
    return this[privContexts].get(extensionId)
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
    const matchedContentScripts = (contentScripts || []).filter((cs) => {
      return CRExtensionMatchPatterns.matchUrls(protocol, hostname, pathname, cs.matches)
    })

    if (matchedContentScripts.length) {
      let contextId
      try {
        contextId = this._getOrCreateContextForScript(extensionId)
      } catch (ex) {
        return
      }

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
        this[privRunEvents].documentStart(execute)
      } else if (runAt === 'document_end') {
        this[privRunEvents].documentEnd(execute)
      } else if (runAt === 'document_idle') {
        this[privRunEvents].documentIdle(execute)
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
    try {
      webFrame.executeJavaScriptInIsolatedWorld(contextId, [
        { code: code, url: url }
      ])
    } catch (ex) {
      /* no-op */
    }
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
        this[privRunEvents].documentStart(execute)
      } else if (runAt === 'document_end') {
        this[privRunEvents].documentEnd(execute)
      } else if (runAt === 'document_idle') {
        this[privRunEvents].documentIdle(execute)
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
      let contextId
      try {
        contextId = this._getOrCreateContextForScript(extensionId)
      } catch (ex) {
        responseCallback(new Error(`Failed to initialize world context for extension "${extensionId}`))
        return
      }
      webFrame.executeJavaScriptInIsolatedWorld(contextId, [
        { code: code }
      ], (res) => {
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
