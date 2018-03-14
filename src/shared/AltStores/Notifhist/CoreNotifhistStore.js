import RemoteStore from '../RemoteStore'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltNotifhistIdentifiers'

const MAX_HISTORY = 10

class CoreNotifhistStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)

    this.notifications = []

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD,
      handleAddNotification: actions.ADD_NOTIFICATION
    })
  }

  /* **************************************************************************/
  // Lifecycle handlers
  /* **************************************************************************/

  handleLoad ({ notifications }) {
    this.notifications = notifications
  }

  /* **************************************************************************/
  // Adding
  /* **************************************************************************/

  handleAddNotification ({ notification, timestamp, id }) {
    this.notifications = [{notification, timestamp, id}]
      .concat(this.notifications)
      .slice(0, MAX_HISTORY)
      .sort((a, b) => b.timestamp - a.timestamp)
  }
}

export default CoreNotifhistStore
