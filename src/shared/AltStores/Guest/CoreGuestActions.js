import RemoteActions from '../RemoteActions'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltGuestIdentifiers'

class CoreGuestActions extends RemoteActions {
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
  // Permissions
  /* **************************************************************************/

  /**
  * Grants a permission
  * @param site: the site
  * @param type: the type of permission
  */
  grantPermission (...args) {
    if (process.type === 'browser') {
      const [site, type] = args
      return { site, type }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('grantPermission', args)
    }
  }

  /**
  * Denies a permission
  * @param site: the site
  * @param type: the type of permission
  */
  denyPermission (...args) {
    if (process.type === 'browser') {
      const [site, type] = args
      return { site, type }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('denyPermission', args)
    }
  }

  /**
  * Defers a permission until later
  * @param site: the site
  * @param type: the type of permission
  */
  deferPermission (...args) {
    if (process.type === 'browser') {
      const [site, type] = args
      return { site, type }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('deferPermission', args)
    }
  }

  /**
  * Clears all permissions on a site
  * @param site: the site
  */
  clearSitePermissions (...args) {
    if (process.type === 'browser') {
      const [site] = args
      return { site }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('clearSitePermissions', args)
    }
  }
}

export default CoreGuestActions
