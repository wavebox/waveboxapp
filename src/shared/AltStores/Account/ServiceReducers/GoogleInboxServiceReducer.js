import CoreGoogleMailServiceReducer from './CoreGoogleMailServiceReducer'

class GoogleInboxServiceReducer extends CoreGoogleMailServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GoogleInboxServiceReducer' }

  /* **************************************************************************/
  // Retirement
  /* **************************************************************************/

  static setGinboxSeenRetirementVersion (service, version) {
    return service.changeData({
      ginboxSeenRetirementVersion: version
    })
  }
}

export default GoogleInboxServiceReducer
