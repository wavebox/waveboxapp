import CoreGuestStore from 'shared/AltStores/Guest/CoreGuestStore'
import permissionPersistence from 'Storage/permissionStorage'
import alt from '../alt'
import { STORE_NAME } from 'shared/AltStores/Guest/AltGuestIdentifiers'
import actions from './guestActions'

class GuestStore extends CoreGuestStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    /* ****************************************/
    // Actions
    /* ****************************************/

    this.bindActions({
      handleGrantPermission: actions.GRANT_PERMISSION,
      handleDenyPermission: actions.DENY_PERMISSION,
      handleDeferPermission: actions.DEFER_PERMISSION,
      handleClearSitePermissions: actions.CLEAR_SITE_PERMISSIONS
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Saves a permission
  * @param site: the site to save for
  * @param rec: the rec to save or undefined/null
  */
  savePermission (site, rec) {
    if (rec) {
      this._permissions_.set(site, rec)
      permissionPersistence.setJSONItem(site, rec)
    } else {
      this._permissions_.delete(site, rec)
      permissionPersistence.removeItem(site)
    }
    this.dispatchToRemote('remoteSetPermission', [site, rec])
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Overwrite
  */
  _remoteConnectReturnValue () {
    return {
      permissions: Array.from(this._permissions_.keys()).reduce((acc, k) => {
        acc[k] = this._permissions_.get(k)
        return acc
      }, {})
    }
  }

  /* **************************************************************************/
  // Handlers: Permissions
  /* **************************************************************************/

  handleGrantPermission ({ site, type }) {
    this.savePermission(site, {
      ...this.getPermissionRec(site),
      [type]: true
    })
  }

  handleDenyPermission ({ site, type }) {
    this.savePermission(site, {
      ...this.getPermissionRec(site),
      [type]: false
    })
  }

  handleDeferPermission ({ site, type }) {
    this.savePermission(site, {
      ...this.getPermissionRec(site),
      [type]: undefined
    })
  }

  handleClearSitePermissions ({ site }) {
    this.savePermission(site, null)
  }
}

export default alt.createStore(GuestStore, STORE_NAME)
