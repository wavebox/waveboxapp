import alt from '../alt'
import CoreNotifhistStore from 'shared/AltStores/Notifhist/CoreNotifhistStore'
import { STORE_NAME } from 'shared/AltStores/Notifhist/AltNotifhistIdentifiers'
import actions from './notifhistActions'  // eslint-disable-line
import persistence from 'Storage/notifhistStorage'

class NotifhistStore extends CoreNotifhistStore {
  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Overwrite
  */
  _remoteConnectReturnValue () {
    return {
      notifications: this.notifications
    }
  }

  /* **************************************************************************/
  // Handlers: Adding
  /* **************************************************************************/

  handleAddNotification (payload) {
    super.handleAddNotification(payload)
    persistence.setJSONItem('notifications', this.notifications)
    this.dispatchToUniversalRemote('addNotification', [payload.notification, payload.timestamp, payload.id])
  }
}

export default alt.createStore(NotifhistStore, STORE_NAME)
