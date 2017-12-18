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
      'google/logo_slides_32px.png',
      'google/logo_slides_48px.png',
      'google/logo_slides_64px.png',
      'google/logo_slides_96px.png',
      'google/logo_slides_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://slides.google.com' }
}

module.exports = GoogleSlidesService
