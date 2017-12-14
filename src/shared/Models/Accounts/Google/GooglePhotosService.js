const GoogleService = require('./GoogleService')

class GooglePhotosService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.PHOTOS }
  static get humanizedType () { return 'Google Photos' }
  static get humanizedTypeShort () { return 'Photos' }
  static get humanizedLogos () {
    return [
      'google/logo_photos_32px.png',
      'google/logo_photos_48px.png',
      'google/logo_photos_64px.png',
      'google/logo_photos_96px.png',
      'google/logo_photos_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://photos.google.com' }
}

module.exports = GooglePhotosService
