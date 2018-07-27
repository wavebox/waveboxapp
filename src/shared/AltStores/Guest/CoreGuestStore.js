import RemoteStore from '../RemoteStore'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltGuestIdentifiers'

class CoreGuestStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)
    this._permissions_ = new Map()

    /* ****************************************/
    // Permissions
    /* ****************************************/

    /**
    * Gets the permission record
    * @param site: the site to get the permission for
    * @return the entire record for the permission
    */
    this.getPermissionRec = (site) => {
      return this._permissions_.get(site) || {}
    }

    /**
    * Gets the a specific permission
    * @param site: the site to get the permission for
    * @param type: the permission type
    * @return one of granted, denied, default
    */
    this.getPermission = (site, type) => {
      switch (this.getPermissionRec(site)[type]) {
        case true: return 'granted'
        case false: return 'denied'
        default: return 'default'
      }
    }

    /**
    * @return a list of all known sites
    */
    this.getPermissionSites = () => {
      return Array.from(this._permissions_.keys())
    }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad ({ permissions }) {
    this._permissions_ = Object.keys(permissions).reduce((acc, k) => {
      acc.set(k, permissions[k])
      return acc
    }, new Map())
  }
}

export default CoreGuestStore
