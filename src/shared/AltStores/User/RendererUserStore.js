import CoreUserStore from './CoreUserStore'
import { ACTIONS_NAME } from './AltUserIdentifiers'
import { ACContainerSAPI } from '../../Models/ACContainer'

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
      handleRemoteSetClientToken: actions.REMOTE_SET_CLIENT_TOKEN,
      handleRemoteSetContainerSAPI: actions.REMOTE_SET_CONTAINER_SAPI
    })
  }

  /* **************************************************************************/
  // User & env
  /* **************************************************************************/

  handleRemoteSetClientToken ({ clientToken }) {
    this.clientToken = clientToken
  }

  handleRemoteSetContainerSAPI ({ containerSAPI }) {
    this.containerSAPI = Object.keys(containerSAPI || {}).reduce((acc, id) => {
      acc.set(id, new ACContainerSAPI(containerSAPI[id]))
      return acc
    }, new Map())
  }
}

export default RendererUserStore
