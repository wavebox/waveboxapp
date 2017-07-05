const extensionStore = require('../../stores/extensionStore')
const path = require('path')
const {
  USER_EXTENSION_INSTALL_PATH
} = require('../../MProcManagers/PathManager')
const {
  WAVEBOX_HOSTED_EXTENSION_PROTOCOL
} = require('../../../shared/extensionApis')

class HostedExtensionProvider {
  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get supportedProtocols () {
    return [
      WAVEBOX_HOSTED_EXTENSION_PROTOCOL
    ]
  }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  /**
  * Gets the extension from the partition
  * @param partition: the extension partition
  * @return the extension or null
  */
  _getExtensionFromPartition (partition) {
    const installId = partition.startsWith('persist:') ? partition.replace('persist:', '') : partition
    return extensionStore.getExtension(installId)
  }

  /**
  * Handles an incoming request and serves the file if permitted
  * @param partition: the partition to action on
  * @param request: the incoming request
  * @param responder: the callback to execute on completion
  */
  handleFileProtocolRequest (partition, request, responder) {
    const extension = this._getExtensionFromPartition(partition)
    if (!extension) { responder(403); return }
    if (!extension.manifest.hasHostedComponent) { responder(403); return }

    const uri = path.basename(request.url.replace(WAVEBOX_HOSTED_EXTENSION_PROTOCOL, ''))
    const uriLocalPath = path.join(USER_EXTENSION_INSTALL_PATH, extension.installId, 'bin', uri)
    responder(uriLocalPath)
  }
}

module.exports = new HostedExtensionProvider()
