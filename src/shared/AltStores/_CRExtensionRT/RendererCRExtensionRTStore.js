import CoreCRExtensionRTStore from './CoreCRExtensionRTStore'
import {
  ACTIONS_NAME
} from './AltCRExtensionRTIdentifiers'

class RendererCRExtensionRTStore extends CoreCRExtensionRTStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super()

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({

    })
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/


}

export default RendererCRExtensionRTStore
