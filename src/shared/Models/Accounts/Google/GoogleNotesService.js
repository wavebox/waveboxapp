const CoreService = require('../CoreService')

class GoogleNotesService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.NOTES }
  static get humanizedType () { return 'Google Keep' }
  static get humanizedLogos () {
    return [
      'images/google/logo_keep_32px.png',
      'images/google/logo_keep_48px.png',
      'images/google/logo_keep_64px.png',
      'images/google/logo_keep_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://keep.google.com' }
}

module.exports = GoogleNotesService
