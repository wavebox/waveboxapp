const GoogleService = require('./GoogleService')

class GoogleStorageService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.STORAGE }
  static get humanizedType () { return 'Google Drive' }
  static get humanizedTypeShort () { return 'Drive' }
  static get humanizedLogos () {
    return [
      'google/logo_drive_32px.png',
      'google/logo_drive_48px.png',
      'google/logo_drive_64px.png',
      'google/logo_drive_96px.png',
      'google/logo_drive_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://drive.google.com' }
}

module.exports = GoogleStorageService
