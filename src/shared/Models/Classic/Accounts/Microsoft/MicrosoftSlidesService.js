const MicrosoftService = require('./MicrosoftService')

class MicrosoftSlidesService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.SLIDES }
  static get humanizedType () { return 'PowerPoint' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_slides_32px.png',
      'microsoft/logo_slides_48px.png',
      'microsoft/logo_slides_64px.png',
      'microsoft/logo_slides_96px.png',
      'microsoft/logo_slides_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://office.live.com/start/PowerPoint.aspx' }
}

module.exports = MicrosoftSlidesService
