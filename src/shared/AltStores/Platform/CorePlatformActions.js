import RemoteActions from '../RemoteActions'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltPlatformIdentifiers'

class CorePlatformActions extends RemoteActions {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get displayName () { return ACTIONS_NAME }

  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () {
    throw new Error('Action not implemented "load"')
  }

  /* **************************************************************************/
  // Login
  /* **************************************************************************/

  /**
  * @param openAtLogin: true to open at login
  * @param openAsHidden: true to open as hidden
  */
  changeLoginPref (openAtLogin, openAsHidden) {
    throw new Error('Action not implemented "changeLoginPref"')
  }

  /* **************************************************************************/
  // Mailto
  /* **************************************************************************/

  /**
  * Sets if the app is the default mailto link handler
  * @param isCurrentApp: true if this is the handler
  */
  changeMailtoLinkHandler (isCurrentApp) {
    throw new Error('Action not implemented "changeMailtoLinkHandler"')
  }
}

export default CorePlatformActions
