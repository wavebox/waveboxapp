import CorePlatformActions from 'shared/AltStores/Platform/CorePlatformActions'
import alt from '../alt'
import DistributionConfig from 'Runtime/DistributionConfig'

class PlatformActions extends CorePlatformActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return {
      installMethod: DistributionConfig.installMethod
    }
  }
}

export default alt.createActions(PlatformActions)
