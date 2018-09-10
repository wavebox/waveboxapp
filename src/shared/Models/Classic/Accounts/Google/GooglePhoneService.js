const GoogleService = require('./GoogleService')

class GooglePhoneService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.PHONE }
  static get humanizedType () { return 'Google Voice' }
  static get humanizedTypeShort () { return 'Voice' }
  static get humanizedLogos () {
    return [
      'google/logo_voice_32px.png',
      'google/logo_voice_48px.png',
      'google/logo_voice_64px.png',
      'google/logo_voice_96px.png',
      'google/logo_voice_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://voice.google.com' }
}

module.exports = GooglePhoneService
