import { SessionManager } from 'SessionManager'
import mailboxStore from 'stores/mailbox/mailboxStore'
import CRExtensionManager from 'Extensions/Chrome/CRExtensionManager'

class WaveboxDataManager {
  /* ****************************************************************************/
  // Cleaning
  /* ****************************************************************************/

  /**
  * Cleans expired sessions
  */
  cleanExpiredSessions () {
    const expire = new Set(SessionManager.getAllDiskSessionIdsSync())
    const activeSessionIds = [].concat(
      mailboxStore.getState().getActiveSessionIds(),
      CRExtensionManager.runtimeHandler.inUsePartitions
    )
    activeSessionIds.forEach((id) => expire.delete(id))

    Array.from(expire).reduce((acc, id) => {
      return acc
        .then(() => SessionManager.clearSessionFull(id))
    }, Promise.resolve())
  }
}

export default new WaveboxDataManager()
