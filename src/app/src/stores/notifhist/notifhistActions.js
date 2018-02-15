import CoreNotifhistActions from 'shared/AltStores/Notifhist/CoreNotifhistActions'
import persistence from 'Storage/notifhistStorage'
import alt from '../alt'

class NotifhistActions extends CoreNotifhistActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    const allData = persistence.allJSONItems()
    return {
      notifications: allData.notifications || []
    }
  }
}

export default alt.createActions(NotifhistActions)
