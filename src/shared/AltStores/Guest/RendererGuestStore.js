import CoreGuestStore from './CoreGuestStore'
import { ACTIONS_NAME } from './AltGuestIdentifiers'

class RendererGuestStore extends CoreGuestStore {
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
      handleRemoteSetPermission: actions.REMOTE_SET_PERMISSION
    })
  }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  handleRemoteSetPermission ({ site, rec }) {
    if (rec) {
      this._permissions_.set(site, rec)
    } else {
      this._permissions_.delete(site)
    }
  }
}

export default RendererGuestStore
