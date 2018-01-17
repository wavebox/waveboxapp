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
  // Login
  /* **************************************************************************/

  /**
  * @overwrite
  */
  changeLoginPref (...args) {
    return this.remoteDispatch('changeLoginPref', args)
  }

  /* **************************************************************************/
  // Mailto
  /* **************************************************************************/

  /**
  * @overwrite
  */
  changeMailtoLinkHandler (...args) {
    return this.remoteDispatch('changeMailtoLinkHandler', args)
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
