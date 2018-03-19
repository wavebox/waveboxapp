import RemoteActions from '../RemoteActions'
import uuid from 'uuid'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltNotifhistIdentifiers'

class CoreNotifhistActions extends RemoteActions {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get displayName () { return ACTIONS_NAME }

  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () {
    throw new Error('Action not implemented "load"')
  }

  /* **************************************************************************/
  // Adding
  /* **************************************************************************/

  /**
  * Adds a notification
  * @param notification: the notification to add
  * @param timestamp=now: the time the notification was created
  * @param id=auto: a unique id for the notification
  */
  addNotification (...args) {
    return this.universalDispatch('addNotification', args, (notification, timestamp = new Date().getTime(), id = uuid.v4()) => {
      return { notification, timestamp, id }
    })
  }
}

export default CoreNotifhistActions
