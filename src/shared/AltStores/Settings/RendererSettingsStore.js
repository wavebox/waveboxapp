import CoreSettingsStore from './CoreSettingsStore'
import { ACTIONS_NAME } from './AltSettingsIdentifiers'

class RendererSettingsStore extends CoreSettingsStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleRemoteSetSettingsModel: actions.REMOTE_SET_SETTINGS_MODEL
    })
  }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  handleRemoteSetSettingsModel ({ id, modelJS }) {
    this[id] = this.modelize(id, modelJS)
  }
}

export default RendererSettingsStore
