import CoreGoogleMailServiceReducer from './CoreGoogleMailServiceReducer'

class GoogleMailServiceReducer extends CoreGoogleMailServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GoogleMailServiceReducer' }

  /* **************************************************************************/
  // Google Inbox
  /* **************************************************************************/

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

export default GoogleMailServiceReducer
