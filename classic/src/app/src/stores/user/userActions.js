import CoreUserActions from 'shared/AltStores/User/CoreUserActions'
import alt from '../alt'
import PersistenceBootstrapper from './PersistenceBootstrapper'

class UserActions extends CoreUserActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return PersistenceBootstrapper.load()
  }
}

export default alt.createActions(UserActions)
