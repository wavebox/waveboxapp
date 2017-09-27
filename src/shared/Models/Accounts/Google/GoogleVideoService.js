const GoogleService = require('./GoogleService')

class GoogleVideoService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.VIDEO }
  static get humanizedType () { return 'YouTube' }
  static get humanizedLogos () {
    return [
      'images/google/logo_youtube_32px.png',
      'images/google/logo_youtube_48px.png',
      'images/google/logo_youtube_64px.png',
      'images/google/logo_youtube_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://www.youtube.com/' }
}

module.exports = GoogleVideoService
