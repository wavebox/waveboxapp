const CoreService = require('../CoreService')

class GoogleCommunicationService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.COMMUNICATION }
  static get humanizedType () { return 'Google Hangouts' }
  static get humanizedLogos () {
    return [
      'images/google/logo_hangouts_32px.png',
      'images/google/logo_hangouts_48px.png',
      'images/google/logo_hangouts_64px.png',
      'images/google/logo_hangouts_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://hangouts.google.com' }
}

module.exports = GoogleCommunicationService
