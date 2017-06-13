const GoogleService = require('./GoogleService')

class GooglePhotosService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.PHOTOS }
  static get humanizedType () { return 'Google Photos' }
  static get humanizedLogos () {
    return [
      'images/google/logo_photos_32px.png',
      'images/google/logo_photos_48px.png',
      'images/google/logo_photos_64px.png',
      'images/google/logo_photos_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://photos.google.com' }
}

module.exports = GooglePhotosService
