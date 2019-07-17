import { SessionManager } from 'SessionManager'
import accountStore from 'stores/account/accountStore'
import KRXFramework from 'Extensions/KRXFramework'

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
      accountStore.getState().allPartitions(),
      KRXFramework.inUsePartitions()
    )
    activeSessionIds.forEach((id) => expire.delete(id))

    Array.from(expire).reduce((acc, id) => {
      return acc
        .then(() => SessionManager.clearSessionFull(id))
    }, Promise.resolve())
  }
}

export default new WaveboxDataManager()
