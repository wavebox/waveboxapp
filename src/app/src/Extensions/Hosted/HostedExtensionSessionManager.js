import { session } from 'electron'
import HostedExtensionProvider from './HostedExtensionProvider'

class HostedExtensionSessionManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.__managed__ = new Set()
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

    this.__managed__.add(partition)
  }
}

export default new HostedExtensionSessionManager()
