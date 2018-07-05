import alt from '../alt'
import CoreEmblinkStore from 'shared/AltStores/Emblink/CoreEmblinkStore'
import { STORE_NAME } from 'shared/AltStores/Emblink/AltEmblinkIdentifiers'
import actions from './emblinkActions'  // eslint-disable-line

class EmblinkStore extends CoreEmblinkStore {
  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Overwrite
  */
  _remoteConnectReturnValue () {
    return {
      open: this.open,
      compose: this.compose
    }
  }

  /* **************************************************************************/
  // Handlers: Compose
  /* **************************************************************************/

  handleComposeNewMessage (payload) {
    super.handleComposeNewMessage(payload)
    this.dispatchToUniversalRemote('composeNewMessage', [payload.serviceId])
  }

  handleClearCompose (payload) {
    super.handleClearCompose(payload)
    this.dispatchToUniversalRemote('clearCompose', [])
  }

  handleComposeNewMailtoLink (payload) {
    super.handleComposeNewMailtoLink(payload)
    this.dispatchToUniversalRemote('composeNewMailtoLink', [
      payload.mailtoLink,
      payload.serviceId
    ])
  }

  /* **************************************************************************/
  // Handlers: Open
  /* **************************************************************************/

  handleOpenItem (payload) {
    super.handleOpenItem(payload)
    this.dispatchToUniversalRemote('openItem', [
      payload.serviceId,
      payload.openPayload
    ])
  }

  handleClearOpenItem (payload) {
    super.handleClearOpenItem(payload)
    this.dispatchToUniversalRemote('clearOpenItem', [])
  }
}

export default alt.createStore(EmblinkStore, STORE_NAME)
