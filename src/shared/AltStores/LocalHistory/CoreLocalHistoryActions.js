import RemoteActions from '../RemoteActions'
import uuid from 'uuid'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltLocalHistoryIdentifiers'

class CoreLocalHistoryActions extends RemoteActions {
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
  // Notifications
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

  /**
  * Clears all notifications
  */
  clearAllNotifications (...args) {
    return this.universalDispatch('clearAllNotifications', args, () => {
      return { }
    })
  }

  /* **************************************************************************/
  // Downloads
  /* **************************************************************************/

  /**
  * Clears all inactive downloads
  */
  clearAllDownloads (...args) {
    if (process.type === 'browser') {
      return { }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('clearAllDownloads', args)
    }
  }

  /**
  * Clears a specific download
  * @param id: the id of the download
  */
  deleteDownload (...args) {
    if (process.type === 'browser') {
      const [ id ] = args
      return { id }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('deleteDownload', args)
    }
  }

  /**
  * Shows a download in it's folder
  * @param id: the id of the download
  */
  showDownloadInFolder (id) {
    return { id }
  }

  /**
  * Attempts to cancel a running download
  */
  cancelActiveDownload (id) {
    return { id }
  }
}

export default CoreLocalHistoryActions
