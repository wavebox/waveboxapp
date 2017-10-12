const req = require('../../req')
const electron = require('electron')
const { runInThisContext } = require('vm')
const CRExtensionApi = require('./CRExtensionApi')
const {
  CR_EXTENSION_PROTOCOL,
  CR_RUNTIME_ENVIRONMENTS
} = req.shared('extensionApis.js')
const { CRExtensionMatchPatterns } = req.shared('Models/CRExtension')
const GuestHost = require('../../GuestHost')

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

  get isBackgroundPage () {
    return process.argv.findIndex((arg) => arg === '--background-page') !== -1
  }

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
    if (hostUrl.protocol === `${CR_EXTENSION_PROTOCOL}:`) {
      if (this.isBackgroundPage) {
        window.chrome = new CRExtensionApi(hostUrl.hostname, CR_RUNTIME_ENVIRONMENTS.BACKGROUND)
      } else {
        window.chrome = new CRExtensionApi(hostUrl.hostname, CR_RUNTIME_ENVIRONMENTS.HOSTED)
      }
    } else if (hostUrl.protocol === 'http:' || hostUrl.protocol === 'https:') {
      const preferences = process.getRenderProcessPreferences()
      if (preferences) {
        for (const pref of preferences) {
          if (pref.crExtensionContentScripts) {
            for (const script of pref.crExtensionContentScripts) {
              this._injectContentScript(hostUrl.protocol, hostUrl.hostname, hostUrl.pathname, pref.extensionId, script)
            }
          }
        }
      }
    }
  }

  /**
  * Injects a content script into the UI
  * @param protocl: the host protocl
  * @param hostname: the host hostname
  * @param pathname: the host pathname
  * @param extensionId: the id of the extension to inject
  * @param script: the info about the script to inject
  */
  _injectContentScript (protocol, hostname, pathname, extensionId, script) {
    const match = CRExtensionMatchPatterns.matchUrls(protocol, hostname, pathname, script.matches)
    if (!match) { return }

    script.js.forEach(({url, code}) => {
      const execute = this._executeContentScript.bind(window, extensionId, url, code)
      if (script.runAt === 'document_start') {
        if (this.isContextlessDocument) {
          setTimeout(execute)
        } else {
          process.once('document-start', execute)
        }
      } else if (script.runAt === 'document_end') {
        if (this.isContextlessDocument) {
          electron.remote.getCurrentWebContents().once('dom-ready', execute)
        } else {
          process.once('document-end', execute)
        }
      } else if (script.runAt === 'document_idle') {
        if (this.isContextlessDocument) {
          electron.remote.getCurrentWebContents().once('dom-ready', execute)
        } else {
          document.addEventListener('DOMContentLoaded', execute)
        }
      }
    })
  }

  /**
  * Executes the content script
  * @param extensionId: the id of the extension to inject
  * @param url: the url of the code
  * @param code: the code to inject
  */
  _executeContentScript (extensionId, url, code) {
    const chrome = new CRExtensionApi(extensionId, CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT)
    const wrapper = `(function (chrome) {\n ${code} \n})`
    const compiledWrapper = runInThisContext(wrapper, {
      filename: url,
      lineOffset: 1,
      displayErrors: true
    })
    return compiledWrapper.call(this, chrome)
  }
}

module.exports = new CRExtensionLoader()
