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

  /* **************************************************************************/
  // Login
  /* **************************************************************************/

  /**
  * @overwrite
  */
  changeLoginPref (openAtLogin, openAsHidden) {
    return { openAtLogin, openAsHidden }
  }

  /* **************************************************************************/
  // Mailto
  /* **************************************************************************/

  /**
  * @overwrite
  */
  changeMailtoLinkHandler (isCurrentApp) {
    return { isCurrentApp }
  }
}

export default alt.createActions(PlatformActions)
