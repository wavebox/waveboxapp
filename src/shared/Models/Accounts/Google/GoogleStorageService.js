const CoreService = require('../CoreService')

class GoogleStorageService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.STORAGE }
  static get humanizedType () { return 'Google Drive' }
  static get humanizedLogos () {
    return [
      'images/google/logo_drive_32px.png',
      'images/google/logo_drive_48px.png',
      'images/google/logo_drive_64px.png',
      'images/google/logo_drive_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://drive.google.com' }
}

module.exports = GoogleStorageService
