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
      handleRemoteSetSettingsModel: actions.REMOTE_SET_SETTINGS_MODEL,
      handleRemoteSetAsset: actions.REMOTE_SET_ASSET
    })
  }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  handleRemoteSetSettingsModel ({ id, modelJS }) {
    this[id] = this.modelize(id, modelJS)
  }

  handleRemoteSetAsset ({ id, b64Asset }) {
    this._assets_.set(id, b64Asset)
  }
}

export default RendererSettingsStore
