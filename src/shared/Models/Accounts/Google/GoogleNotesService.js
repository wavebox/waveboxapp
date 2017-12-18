const GoogleService = require('./GoogleService')

class GoogleNotesService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.NOTES }
  static get humanizedType () { return 'Google Keep' }
  static get humanizedTypeShort () { return 'Keep' }
  static get humanizedLogos () {
    return [
      'google/logo_keep_32px.png',
      'google/logo_keep_48px.png',
      'google/logo_keep_64px.png',
      'google/logo_keep_96px.png',
      'google/logo_keep_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://keep.google.com' }
}

module.exports = GoogleNotesService
