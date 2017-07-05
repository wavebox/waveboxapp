const fs = require('fs-extra')
const path = require('path')
const ExtensionPreprocess = require('./ExtensionPreprocess')
const {
  WAVEBOX_CONTENT_IMPL_ENDPOINTS,
  VALID_WAVEBOX_CONTENT_IMPL_ENDPOINTS
} = require('../../../shared/extensionApis')
const { NotificationPermissionManager } = require('../../MProcManagers')

const WAVEBOX_API_PATH = path.join(__dirname, '../../../../guestApi')

class WaveboxContentImplProvider {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.cache = new Map()
  }

  /* ****************************************************************************/
  // Handlers
  /* ****************************************************************************/

  /**
  * Handles a request coming in
  * @param request: the incoming request
  * @param route: the route this matched on
  * @return promise
  */
  handleRequest (request, route) {
    if (VALID_WAVEBOX_CONTENT_IMPL_ENDPOINTS.has(route.src)) {
      return Promise.resolve()
        .then(() => this._loadFile(route.src))
        .then((js) => this._preprocessJSFile(route, js))
    } else {
      return Promise.reject(new Error('Unknown Source'))
    }
  }

  /* ****************************************************************************/
  // Loaders
  /* ****************************************************************************/

  /**
  * Loads a wavebox file
  * @param src: the resource to load
  * @return promise
  */
  _loadFile (src) {
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src))
    } else {
      return Promise.resolve()
        .then(() => fs.readFile(path.join(WAVEBOX_API_PATH, src), 'utf8'))
        .then((data) => {
          this.cache.set(src, data)
          return Promise.resolve(data)
        })
    }
  }

  /**
  * Preprocesses the javascript file
  * @param route: the route that was sent
  * @param js: the javascript
  * @return promise
  */
  _preprocessJSFile (route, js) {
    if (route.src === WAVEBOX_CONTENT_IMPL_ENDPOINTS.NOTIFICATION) {
      return Promise.resolve()
        .then(() => NotificationPermissionManager.getDomainPermission(route.requestUrl))
        .then((permission) => {
          const config = { permission: permission }
          return Promise.resolve(ExtensionPreprocess.wrapJSModule(js, route.apiKey, config))
        })
    } else {
      return Promise.resolve(ExtensionPreprocess.wrapJSModule(js, route.apiKey))
    }
  }
}

module.exports = WaveboxContentImplProvider
