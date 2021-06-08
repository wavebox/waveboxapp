import CorePlatformActions from './CorePlatformActions'

class RendererPlatformActions extends CorePlatformActions {
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
  // Remote
  /* **************************************************************************/

  /**
  * Emits a change in the store to indicate an upstream change
  */
  remoteEmitChange () { return { } }
}

export default RendererPlatformActions
