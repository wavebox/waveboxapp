class ExtensionRoute {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param requestUrl: the url that requested the extension
  * @param loadKey: the key to load
  * @param apiKey: the api key to inject to the extension
  * @param protocol: the protocol the call will be expected on
  * @param src: the source of the extension
  * @param data={}: any additional data that comes along with the request
  */
  constructor (requestUrl, loadKey, apiKey, protocol, src, data = {}) {
    this.__data__ = Object.freeze({
      requestUrl: requestUrl,
      loadKey: loadKey,
      apiKey: apiKey,
      protocol: protocol,
      src: src,
      data: data
    })
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get requestUrl () { return this.__data__.requestUrl }
  get extensionUrl () { return `${this.protocol}://${this.loadKey}` }
  get loadKey () { return this.__data__.loadKey }
  get apiKey () { return this.__data__.apiKey }
  get protocol () { return this.__data__.protocol }
  get src () { return this.__data__.src }
  get data () { return this.__data__.data }
}

module.exports = ExtensionRoute
