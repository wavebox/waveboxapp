const req = require('../../req')
const { runInThisContext } = require('vm')
const CRExtensionApi = require('./CRExtensionApi')
const {
  CR_EXTENSION_PROTOCOL,
  CR_RUNTIME_ENVIRONMENTS
} = req.shared('extensionApis.js')

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

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Loads the extension
  */
  load () {
    if (this._hasLoaded) { return }

    if (window.location.protocol === `${CR_EXTENSION_PROTOCOL}:`) {
      if (this.isBackgroundPage) {
        window.chrome = new CRExtensionApi(window.location.hostname, CR_RUNTIME_ENVIRONMENTS.BACKGROUND)
      } else {
        window.chrome = new CRExtensionApi(window.location.hostname, CR_RUNTIME_ENVIRONMENTS.HOSTED)
      }
    } else if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      const preferences = process.getRenderProcessPreferences()
      if (preferences) {
        for (const pref of preferences) {
          if (pref.crExtensionContentScripts) {
            for (const script of pref.crExtensionContentScripts) {
              this._injectContentScript(pref.extensionId, script)
            }
          }
        }
      }
    }
  }

  /**
  * Checks if a url pattern matches the current url
  * More info https://developer.chrome.com/extensions/match_patterns
  */
  _matchesPattern (pattern) {
    if (pattern === '<all_urls>') { return true }
    const regexp = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
    return url.match(regexp)
  }

  /**
  * Injects a content script into the UI
  * @param extensionId: the id of the extension to inject
  * @param script: the info about the script to inject
  */
  _injectContentScript (extensionId, script) {
    if (!script.matches.some(this._matchesPattern)) { return }

    script.js.forEach(({url, code}) => {
      const execute = this._executeContentScript.bind(window, extensionId, url, code)
      if (script.runAt === 'document_start') {
        process.once('document-start', execute)
      } else if (script.runAt === 'document_end') {
        process.once('document-end', execute)
      } else if (script.runAt === 'document_idle') {
        document.addEventListener('DOMContentLoaded', execute)
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
