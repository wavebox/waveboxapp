import CoreCRExtensionActions from './CoreCRExtensionActions'

class RendererCRExtensionActions extends CoreCRExtensionActions {
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

export default RendererCRExtensionActions
