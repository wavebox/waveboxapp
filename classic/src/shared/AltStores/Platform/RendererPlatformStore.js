import CorePlatformStore from './CorePlatformStore'
import {
  ACTIONS_NAME
} from './AltPlatformIdentifiers'

class RendererPlatformStore extends CorePlatformStore {
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
      handleRemoteEmitChange: actions.REMOTE_EMIT_CHANGE
    })
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  handleRemoteEmitChange () {
    this.emitChange()
  }
}

export default RendererPlatformStore
