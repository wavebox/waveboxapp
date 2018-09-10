import CoreGuestActions from 'shared/AltStores/Guest/CoreGuestActions'
import alt from '../alt'
import permissionPersistence from 'Storage/permissionStorage'

class GuestActions extends CoreGuestActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return {
      permissions: permissionPersistence.allJSONItems(),
      permissionRequestDialogs: {}
    }
  }
}

const actions = alt.createActions(GuestActions)
export default actions
