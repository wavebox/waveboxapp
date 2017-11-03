const req = require('../req')
const { remote, webFrame } = require('electron')
const { CRExtensionMatchPatterns } = req.shared('Models/CRExtension')
const { WBECRX_EXECUTE_SCRIPT } = req.shared('ipcEvents')
const GuestHost = require('../GuestHost')
const CRExtensionPopoutPostMessageListener = require('./CRExtensionPopoutPostMessageListener')
const DispatchManager = require('../DispatchManager')

class CRExtensionLoader {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this._hasLoaded = false
    this._contexts = new Map()
    this.popoutPostMessageListner = new CRExtensionPopoutPostMessageListener()

    DispatchManager.registerHandler(WBECRX_EXECUTE_SCRIPT, this._handleCRXExecuteScript.bind(this))
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
    if (this._hasLoaded) { return }
    this._hasLoaded = true

    const hostUrl = GuestHost.parsedUrl
    if (hostUrl.protocol === 'http:' || hostUrl.protocol === 'https:') {
      const preferences = process.getRenderProcessPreferences()
      if (preferences) {
        for (const pref of preferences) {
          if (pref.crExtensionContentScripts) {
            this._initializeExtensionContentScript(hostUrl.protocol, hostUrl.hostname, hostUrl.pathname, pref.extensionId, pref.crExtensionContentScripts)
          }
          if (pref.popoutWindowPostmessageCapture) {
            this._capturePopoutWindowPostmessages(hostUrl.protocol, hostUrl.hostname, hostUrl.pathname, pref.extensionId, pref.popoutWindowPostmessageCapture)
          }
        }
      }
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
    if (!this._contexts.has(extensionId)) {
      const contextId = webFrame.createContext(extensionId, JSON.stringify({
        preload: req.crextensionApiPath(),
        crExtensionCSAutoInit: true,
        crExtensionCSExtensionId: extensionId,
        crExtensionCSGuestHost: GuestHost.url
      }))
      this._contexts.set(extensionId, contextId)
      return contextId
    } else {
      return this._contexts.get(extensionId)
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
        if (this.isContextlessDocument) {
          setTimeout(execute)
        } else {
          process.once('document-start', execute)
        }
      } else if (runAt === 'document_end') {
        if (this.isContextlessDocument) {
          remote.getCurrentWebContents().once('dom-ready', execute)
        } else {
          document.addEventListener('DOMContentLoaded', execute)
        }
      } else if (runAt === 'document_idle') {
        remote.getCurrentWebContents().once('dom-ready', execute)
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
          remote.getCurrentWebContents().once('dom-ready', execute)
        } else {
          document.addEventListener('DOMContentLoaded', execute)
        }
      } else if (runAt === 'document_idle') {
        remote.getCurrentWebContents().once('dom-ready', execute)
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
  // Loading: Popout windows
  /* **************************************************************************/

  /**
  * Starts an extension post message capture in the current page
  * @param protocol: the host protocl
  * @param hostname: the host hostname
  * @param pathname: the host pathname
  * @param extensionId: the id of the extension to inject
  * @param popoutWindowPostmessageCapture: the configuration for the opener
  */
  _capturePopoutWindowPostmessages (protocol, hostname, pathname, extensionId, popoutWindowPostmessageCapture) {
    const matchedTargets = (popoutWindowPostmessageCapture || []).filter((capture) => {
      if (typeof (capture.matches) === 'string') {
        return CRExtensionMatchPatterns.matchUrl(protocol, hostname, pathname, capture.matches)
      } else if (Array.isArray(capture.matches)) {
        return CRExtensionMatchPatterns.matchUrls(protocol, hostname, pathname, capture.matches)
      } else {
        return false
      }
    })

    if (matchedTargets.length) {
      this.popoutPostMessageListner.addConfigs(matchedTargets)
    }
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  /**
  * Executes a script on behalf of an extension
  * @param evt: the event that fired
  * @param [extensionId, details]: the extension id requesting and details
  * @param responseCallback: the response callback to reply with
  */
  _handleCRXExecuteScript (evt, [extensionId, details], responseCallback) {
    responseCallback(null, [])
  }
}

module.exports = new CRExtensionLoader()
