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

  /* **************************************************************************/
  // Remote: Containers
  /* **************************************************************************/

  /**
  * Remotely sets all the container SAPI
  * @param containerSAPI: the container sapi to set
  */
  remoteSetContainerSAPI (containerSAPI) {
    return { containerSAPI }
  }
}

export default RendererUserActions
