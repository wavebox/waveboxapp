import CoreUserStore from './CoreUserStore'
import { ACTIONS_NAME } from './AltUserIdentifiers'

class RendererUserStore extends CoreUserStore {
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
      handleRemoteSetClientToken: actions.REMOTE_SET_CLIENT_TOKEN
    })
  }

  /* **************************************************************************/
  // User & env
  /* **************************************************************************/

  handleRemoteSetClientToken ({clientToken}) {
    this.clientToken = clientToken
  }
}

export default RendererUserStore
