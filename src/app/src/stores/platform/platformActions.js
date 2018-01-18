import CorePlatformActions from 'shared/AltStores/Platform/CorePlatformActions'
import alt from '../alt'

class PlatformActions extends CorePlatformActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () { return {} }
}

export default alt.createActions(PlatformActions)
