import { webFrame } from 'electron'
import GuestHost from '../GuestHost'
import fs from 'fs'
import Resolver from 'Runtime/Resolver'
import {
  WAVEBOX_HOSTED_EXTENSION_PROTOCOL,
  CR_EXTENSION_PROTOCOL,
  WAVEBOX_CONTENT_IMPL_ENDPOINTS,
  VALID_WAVEBOX_CONTENT_IMPL_ENDPOINTS
} from 'shared/extensionApis'
import {
  CHROME_PROTOCOL
} from 'shared/constants'

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
const DEQUEUE_ENDPOINTS = new Set([
  /**
  * Because we use contextIsolation, electron re-runs some of the window
  * setup code after the preload script. If we're overwriting anything
  * our overwrites may be overwritten. To prevent this deque the following
  * items to ensure they are loaded last
  */
  WAVEBOX_CONTENT_IMPL_ENDPOINTS.NOTIFICATION,
  WAVEBOX_CONTENT_IMPL_ENDPOINTS.WINDOW_DIALOGS,
  WAVEBOX_CONTENT_IMPL_ENDPOINTS.ONEDRIVE_WINDOW_OPEN
])

class ExtensionLoader {
  static get ENDPOINTS () { return WAVEBOX_CONTENT_IMPL_ENDPOINTS }

  /**
  * Loads a wavebox guest api
  * @param apiName: the name of the api to load
  * @param apiKey='': the api key that can be used to talk back across isolation
  * @param config={}: jsonable object to pass to the api
  * @return promise
  */
  static loadWaveboxGuestApi (apiName, apiKey = '', config = {}) {
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

    const code = fs.readFileSync(Resolver.guestApi(apiName))
    const wrapper = `
      ;(function (WB_API_KEY, WB_CONFIG) {
        ${code}
      })('${apiKey}', ${JSON.stringify(config)})
    `

    if (DEQUEUE_ENDPOINTS.has(apiName)) {
      return new Promise((resolve) => {
        setTimeout(() => {
          webFrame.executeJavaScript(wrapper)
          resolve()
        })
      })
    } else {
      webFrame.executeJavaScript(wrapper)
      return Promise.resolve()
    }
  }
}

export default ExtensionLoader
