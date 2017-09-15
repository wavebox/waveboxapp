const { ipcRenderer, webFrame } = require('electron')
const req = require('../req')
const injector = require('../injector')
const uuid = require('uuid')
const {
  WBE_PROVISION_EXTENSION,
  WBE_PROVISION_EXTENSION_REPLY_PFX
} = req.shared('ipcEvents')
const {
  WAVEBOX_CONTENT_IMPL_PROTOCOL,
  WAVEBOX_CONTENT_EXTENSION_PROTOCOL,
  WAVEBOX_HOSTED_EXTENSION_PROTOCOL,
  CR_EXTENSION_PROTOCOL
} = req.shared('extensionApis')
const SUPPORTED_PROTOCOLS = new Set([
  'http:',
  'https:',
  `${WAVEBOX_HOSTED_EXTENSION_PROTOCOL}:`
])
const SUPPRESSED_PROTOCOLS = new Set([
  `${CR_EXTENSION_PROTOCOL}:`
])

class ExtensionLoader {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    webFrame.registerURLSchemeAsPrivileged(WAVEBOX_CONTENT_IMPL_PROTOCOL)
    webFrame.registerURLSchemeAsPrivileged(WAVEBOX_CONTENT_EXTENSION_PROTOCOL)
  }

  /* **************************************************************************/
  // Load Keys
  /* **************************************************************************/

  /**
  * Generates a unique load key
  * @param ext=undefined: an file type extension if required
  * @return a key that can be used to load an extension
  */
  _generateLoadKey (ext) {
    ext = ext && ext.startsWith('.') ? ext : (ext ? `.${ext}` : '')
    return `${uuid.v4().replace(/-/g, '')}${ext}`
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Provisions an extension to be loaded
  * @param apiKey: the api key that can be used to talk back across isolation
  * @param protocol: the protocol of the api
  * @param src: the name of the api to load
  * @return promise
  */
  _provisionExtension (apiKey, protocol, src) {
    return new Promise((resolve, reject) => {
      const loadKey = this._generateLoadKey('js')
      const replyId = `${WBE_PROVISION_EXTENSION_REPLY_PFX}:${loadKey}`

      ipcRenderer.once(replyId, () => {
        resolve(`${protocol}://${loadKey}`)
      })

      setTimeout(() => { // Fixes a timing issue on-load
        ipcRenderer.send(WBE_PROVISION_EXTENSION, {
          reply: replyId,
          requestUrl: window.location.href,
          loadKey: loadKey,
          apiKey: apiKey,
          protocol: protocol,
          src: src
        })
      })
    })
  }

  /**
  * Loads a wavebox guest api
  * @param apiName: the name of the api to load
  * @param apiKey='': the api key that can be used to talk back across isolation
  * @return promise
  */
  loadWaveboxGuestApi (apiName, apiKey = '') {
    if (SUPPORTED_PROTOCOLS.has(window.location.protocol)) {
      return Promise.resolve()
        .then(() => this._provisionExtension(apiKey, WAVEBOX_CONTENT_IMPL_PROTOCOL, apiName))
        .then((loadUrl) => {
          return new Promise((resolve, reject) => {
            injector.injectJavaScriptUrl(loadUrl, () => {
              resolve()
            })
          })
        })
    } else if (SUPPRESSED_PROTOCOLS.has(window.location.protocol)) {
      /* no-op */
    } else {
      return Promise.reject(new Error('Unsupported Guest Protocol'))
    }
  }
}

module.exports = new ExtensionLoader()
