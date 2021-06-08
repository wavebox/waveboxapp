import CoreGuestActions from './CoreGuestActions'

class RendererGuestActions extends CoreGuestActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return this.remoteConnect()
  }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  /**
  * Sets a permission model from a remote call
  * @param site: the site to set for
  * @param rec: the rec to set
  */
  remoteSetPermission (site, rec) {
    return { site, rec }
  }
}

export default RendererGuestActions
