import CoreUserActions from './CoreUserActions'

class RendererUserActions extends CoreUserActions {
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
  // Remote: User & env
  /* **************************************************************************/

  /**
  * Handles the client token being set remotely
  * @param clientToken: the client token
  */
  remoteSetClientToken (clientToken) {
    return { clientToken }
  }
}

export default RendererUserActions
