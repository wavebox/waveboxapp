import CoreCRExtensionRTActions from './CoreCRExtensionRTActions'

class RendererCRExtensionRTActions extends CoreCRExtensionRTActions {
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

export default RendererCRExtensionRTActions
