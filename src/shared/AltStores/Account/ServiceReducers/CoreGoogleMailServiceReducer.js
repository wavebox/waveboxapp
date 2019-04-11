import ServiceReducer from './ServiceReducer'

class CoreGoogleMailServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'CoreGoogleMailServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the inbox type
  * @param service: the servie to update
  * @param inboxType: the inbox type to set
  */
  static setInboxType (service, inboxType) {
    return service.changeData({
      inboxType: inboxType
    })
  }

  /**
  * Sets the sync interval
  * @param service: the servie to update
  * @param interval: the new interval in ms
  */
  static setSyncInterval (service, interval) {
    return service.changeData({
      syncInterval: interval
    })
  }

  /* **************************************************************************/
  // Google Inbox Retirement
  /* **************************************************************************/

  static setGinboxSeenRetirementVersion (service, version) {
    return service.changeData({
      ginboxSeenRetirementVersion: version
    })
  }

  /**
  * Sets that we've seen the inbox helper
  * @param service: the service to update
  * @param hasSeen: true or false
  */
  static setHasSeenGoogleInboxToGmailHelper (service, hasSeen) {
    return service.changeData({
      hasSeenGoogleInboxToGmailHelper: hasSeen
    })
  }
}

export default CoreGoogleMailServiceReducer
