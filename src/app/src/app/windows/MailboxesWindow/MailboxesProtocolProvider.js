const fs = require('fs-extra')
const path = require('path')
const {
  WAVEBOX_GUEST_APIS,
  VALID_WAVEBOX_GUEST_APIS,
  WAVEBOX_GUEST_APIS_PROTOCOL
} = require('../../../shared/guestApis')
const { DISALLOWED_HTML5_NOTIFICATION_HOSTS } = require('../../../shared/constants')
const { NotificationPermissionManager } = require('../../MProcManagers')

const WAVEBOX_API_PATH = path.join(__dirname, '../../../../scenes/guest/guestApi')

class MailboxesProtocolProvider {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.waveboxCache = new Map()
  }

  /* ****************************************************************************/
  // Wavebox Handlers
  /* ****************************************************************************/

  /**
  * Handles a wavebox url
  * @param request: the incoming request
  * @param responder: callback to execute on completion
  */
  handleWaveboxUrl (request, responder) {
    const res = request.url.substr(WAVEBOX_GUEST_APIS_PROTOCOL.length + 3)
    if (VALID_WAVEBOX_GUEST_APIS.has(res)) {
      Promise.resolve()
        .then(() => this._loadWaveboxFile(res))
        .then((data) => this._preprocessWaveboxFile(res, request, data))
        .then((data) => { responder(data) })
        .catch(() => { responder('') })
    } else {
      responder('')
    }
  }

  /**
  * Loads a wavebox file
  * @param res: the resource to load
  * @return promise
  */
  _loadWaveboxFile (res) {
    if (this.waveboxCache.has(res)) {
      return Promise.resolve(this.waveboxCache.get(res))
    } else {
      return Promise.resolve()
        .then(() => fs.readFile(path.join(WAVEBOX_API_PATH, res), 'utf8'))
        .then((data) => {
          this.waveboxCache.set(res, data)
          return Promise.resolve(data)
        })
    }
  }

  /**
  * Preprocess a wavebox file salting any needed data into it
  * @param res: the resource that's being loaded
  * @param request: the incoming request
  * @param data: the file data
  * @return promise with the updated data
  */
  _preprocessWaveboxFile (res, request, data) {
    if (res === WAVEBOX_GUEST_APIS.NOTIFICATION) {
      return Promise.resolve()
        .then(() => NotificationPermissionManager.getAllDomainPermissions())
        .then((permissions) => {
          const config = {
            permissions: permissions,
            disallowedHosts: DISALLOWED_HTML5_NOTIFICATION_HOSTS
          }
          return Promise.resolve(`
            ;(function (WAVEBOX_CONFIG) {
              ${data}
            })(${JSON.stringify(config)});`)
        })
    } else {
      return Promise.resolve(data)
    }
  }
}

module.exports = MailboxesProtocolProvider
