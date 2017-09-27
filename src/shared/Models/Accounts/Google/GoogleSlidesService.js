const GoogleService = require('./GoogleService')

class GoogleSlidesService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.SLIDES }
  static get humanizedType () { return 'Google Slides' }
  static get humanizedTypeShort () { return 'Slides' }
  static get humanizedLogos () {
    return [
      'images/google/logo_slides_32px.png',
      'images/google/logo_slides_48px.png',
      'images/google/logo_slides_64px.png',
      'images/google/logo_slides_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://slides.google.com' }
}

module.exports = GoogleSlidesService
