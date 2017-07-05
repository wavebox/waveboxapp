const { session, protocol } = require('electron')
const HostedExtensionProvider = require('./HostedExtensionProvider')
const ContentExtensions = require('../Content')

class HostedExtensionSessionManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.__managed__ = new Set()
    protocol.registerStandardSchemes(HostedExtensionProvider.supportedProtocols, { secure: true })
  }

  /* ****************************************************************************/
  // Setup
  /* ****************************************************************************/

  /**
  * Starts managing a session
  * @param parition the name of the partion to manage
  */
  startManagingSession (partition) {
    if (this.__managed__.has(partition)) { return }

    const ses = session.fromPartition(partition)
    HostedExtensionProvider.supportedProtocols.forEach((protocol) => {
      ses.protocol.registerFileProtocol(protocol, (request, responder) => {
        HostedExtensionProvider.handleFileProtocolRequest(partition, request, responder)
      })
    })
    ContentExtensions.supportedProtocols.forEach((protocol) => {
      ses.protocol.registerStringProtocol(protocol, ContentExtensions.handleStringProtocolRequest.bind(ContentExtensions))
    })

    this.__managed__.add(partition)
  }
}

module.exports = new HostedExtensionSessionManager()
