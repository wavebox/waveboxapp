const GoogleService = require('./GoogleService')

class GoogleVideoService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.VIDEO }
  static get humanizedType () { return 'YouTube' }
  static get humanizedLogos () {
    return [
      'google/logo_youtube_32px.png',
      'google/logo_youtube_48px.png',
      'google/logo_youtube_64px.png',
      'google/logo_youtube_96px.png',
      'google/logo_youtube_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://www.youtube.com/' }
}

module.exports = GoogleVideoService
