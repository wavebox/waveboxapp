const WaveboxContentImplProvider = require('./WaveboxContentImplProvider')
const UserExtensionProvider = require('./UserExtensionProvider')
const ExtensionRoute = require('./ExtensionRoute')
const {
  WAVEBOX_CONTENT_IMPL_PROTOCOL,
  WAVEBOX_CONTENT_EXTENSION_PROTOCOL
} = require('../../../shared/extensionApis')

class ContentExtensionProvider {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.provisioned = new Map()

    this.waveboxContentImplProvider = new WaveboxContentImplProvider()
    this.userExtensionProvider = new UserExtensionProvider()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get supportedProtocols () {
    return [
      WAVEBOX_CONTENT_IMPL_PROTOCOL,
      WAVEBOX_CONTENT_EXTENSION_PROTOCOL
    ]
  }

  /* ****************************************************************************/
  // Provisioning & loading
  /* ****************************************************************************/

  /**
  * Provisions an extension for loading
  * @param requestUrl: the url that requested the resource
  * @param loadKey: the key to load
  * @param apiKey: the api key to inject to the extension
  * @param protocol: the protocol the call will be expected on
  * @param src: the source of the extension
  * @param data: any data that is used to process the request
  */
  provisionExtension (requestUrl, loadKey, apiKey, protocol, src, data) {
    const route = new ExtensionRoute(requestUrl, loadKey, apiKey, protocol, src, data)
    this.provisioned.set(route.extensionUrl, route)
  }

  /**
  * Handles a wavebox url
  * @param request: the incoming request
  * @param responder: callback to execute on completion
  */
  handleStringProtocolRequest (request, responder) {
    const route = this.provisioned.get(request.url)
    if (route) {
      this.provisioned.delete(request.url)
      if (route.protocol === WAVEBOX_CONTENT_IMPL_PROTOCOL) {
        this.waveboxContentImplProvider.handleRequest(request, route)
          .then((res) => responder(res))
          .catch((e) => responder(''))
      } else if (route.protocol === WAVEBOX_CONTENT_EXTENSION_PROTOCOL) {
        this.userExtensionProvider.handleRequest(request, route)
          .then((res) => responder(res))
          .catch(() => responder(''))
      } else {
        responder('')
      }
    } else {
      responder('')
    }
  }
}

module.exports = new ContentExtensionProvider()
