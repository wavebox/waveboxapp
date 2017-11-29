import {session} from 'electron'
import {EventEmitter} from 'events'
import { CRExtensionManager } from 'Extensions/Chrome'

class ExtensionSessionManager extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * Binds the listeners and starts responding to requests
  */
  start () {
    if (this._setup) { return }
    this._setup = true

    CRExtensionManager.runtimeHandler.on('extension-started', (extensionId, extension, runtime) => {
      if (runtime.extension.manifest.hasBackground) {
        this.emit('session-managed', session.fromPartition(runtime.backgroundPage.partitionId))
      }
    })
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @return all currently managed sessions
  */
  getAllSessions () {
    return CRExtensionManager.runtimeHandler.inUsePartitions
      .map((partition) => session.fromPartition(partition))
  }
}

export default new ExtensionSessionManager()
