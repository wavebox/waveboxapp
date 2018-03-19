import CoreNotifhistActions from './CoreNotifhistActions'

class RendererNotifhistActions extends CoreNotifhistActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return this.remoteConnect()
  }
}

export default RendererNotifhistActions
