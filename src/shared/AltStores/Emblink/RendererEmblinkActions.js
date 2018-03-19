import CoreEmblinkActions from './CoreEmblinkActions'

class RendererEmblinkActions extends CoreEmblinkActions {
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

export default RendererEmblinkActions
