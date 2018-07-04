const GoogleService = require('./GoogleService')

class GoogleSocialService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.SOCIAL }
  static get humanizedType () { return 'Google Plus' }
  static get humanizedTypeShort () { return 'Google+' }
  static get humanizedLogos () {
    return [
      'google/logo_plus_32px.png',
      'google/logo_plus_48px.png',
      'google/logo_plus_64px.png',
      'google/logo_plus_96px.png',
      'google/logo_plus_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://plus.google.com' }
}

module.exports = GoogleSocialService
