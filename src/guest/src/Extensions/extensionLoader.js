const { webFrame } = require('electron')
const req = require('../req')
const GuestHost = require('../GuestHost')
const {
  WAVEBOX_HOSTED_EXTENSION_PROTOCOL,
  CR_EXTENSION_PROTOCOL,
  WAVEBOX_CONTENT_IMPL_ENDPOINTS,
  VALID_WAVEBOX_CONTENT_IMPL_ENDPOINTS
} = req.shared('extensionApis')
const {
  CHROME_PROTOCOL
} = req.shared('constants')
const SUPPORTED_PROTOCOLS = new Set([
  'http:',
  'https:',
  `${WAVEBOX_HOSTED_EXTENSION_PROTOCOL}:`
])
const SUPPRESSED_PROTOCOLS = new Set([
  `${CR_EXTENSION_PROTOCOL}:`,
  `${CHROME_PROTOCOL}:`,
  'about:'
])

class ExtensionLoader {
  get ENDPOINTS () { return WAVEBOX_CONTENT_IMPL_ENDPOINTS }

  /**
  * Loads a wavebox guest api
  * @param apiName: the name of the api to load
  * @param apiKey='': the api key that can be used to talk back across isolation
  * @param config={}: jsonable object to pass to the api
  * @return promise
  */
  loadWaveboxGuestApi (apiName, apiKey = '', config = {}) {
    if (!VALID_WAVEBOX_CONTENT_IMPL_ENDPOINTS.has(apiName)) {
      return Promise.reject(new Error(`Unsupported Api ${apiName}`))
    }

    const hostUrl = GuestHost.parsedUrl
    if (SUPPRESSED_PROTOCOLS.has(hostUrl.protocol)) {
      return Promise.resolve() /* no-op */
    }
    if (!SUPPORTED_PROTOCOLS.has(hostUrl.protocol)) {
      return Promise.reject(new Error('Unsupported Guest Protocol'))
    }

    const wrapper = `
      ;(function (WB_API_KEY, WB_CONFIG) {
        ${req.guestApi(apiName)}
      })('${apiKey}', ${JSON.stringify(config)})
    `
    webFrame.executeJavaScript(wrapper)
    return Promise.resolve()
  }
}

module.exports = new ExtensionLoader()
