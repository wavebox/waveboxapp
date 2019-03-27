import CoreGoogleMailServiceData from './CoreGoogleMailServiceData'

// @Thomas101#6
class GoogleInboxServiceData extends CoreGoogleMailServiceData {
  /**
  * Generates the open data for the message
  * @param thread: the thread to open
  * @param message: the message to open
  */
  generateMessageOpenData (thread, message) {
    return undefined
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get historyId () { return undefined }
  get unreadThreads () { return [] }
  get unreadCount () { return 0 }
  get trayMessages () { return [] }
  get notifications () { return [] }
}

export default GoogleInboxServiceData
