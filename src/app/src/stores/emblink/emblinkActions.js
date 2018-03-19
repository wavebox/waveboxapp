import CoreEmblinkActions from 'shared/AltStores/Emblink/CoreEmblinkActions'
import alt from '../alt'

class EmblinkActions extends CoreEmblinkActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return {}
  }
}

export default alt.createActions(EmblinkActions)
