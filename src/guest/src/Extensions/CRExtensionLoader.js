const req = require('../req')
const { remote, webFrame } = require('electron')
const { CRExtensionMatchPatterns } = req.shared('Models/CRExtension')
const GuestHost = require('../GuestHost')

class CRExtensionLoader {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this._hasLoaded = false
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
            this._initializeExtension(hostUrl.protocol, hostUrl.hostname, hostUrl.pathname, pref.extensionId, pref.crExtensionContentScripts)
          }
        }
      }
    }
  }

  /**
  * Starts an extension in the current page
  * @param protocol: the host protocl
  * @param hostname: the host hostname
  * @param pathname: the host pathname
  * @param extensionId: the id of the extension to inject
  * @param contentScripts: the configuration for the content scripts
  */
  _initializeExtension (protocol, hostname, pathname, extensionId, contentScripts) {
    if (!webFrame.createContext) { return }

    const matchedContentScripts = (contentScripts || []).filter((cs) => {
      return CRExtensionMatchPatterns.matchUrls(protocol, hostname, pathname, cs.matches)
    })

    if (matchedContentScripts.length) {
      const contextId = webFrame.createContext(extensionId, JSON.stringify({
        preload: req.crextensionApiPath(),
        crExtensionCSAutoInit: true,
        crExtensionCSExtensionId: extensionId
      }))

      matchedContentScripts.forEach(({js, runAt}) => {
        this._injectContentScript(contextId, extensionId, js, runAt)
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
  _injectContentScript (contextId, extensionId, js, runAt) {
    js.forEach(({url, code}) => {
      const execute = this._executeContentScript.bind(window, contextId, extensionId, url, code)

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
  * Executes the content script
  * @param contextId: the id of the context
  * @param extensionId: the id of the extension to inject
  * @param url: the url of the code
  * @param code: the code to inject
  */
  _executeContentScript (contextId, extensionId, url, code) {
    webFrame.executeContextScript(contextId, code)
  }
}

module.exports = new CRExtensionLoader()
