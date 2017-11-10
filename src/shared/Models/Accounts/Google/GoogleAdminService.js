const GoogleService = require('./GoogleService')

class GoogleAdminService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.ADMIN }
  static get humanizedType () { return 'Google Admin' }
  static get humanizedTypeShort () { return 'Admin' }
  static get humanizedLogos () {
    return [
      'images/google/logo_admin_32px.png',
      'images/google/logo_admin_48px.png',
      'images/google/logo_admin_64px.png',
      'images/google/logo_admin_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://admin.google.com' }
}

module.exports = GoogleAdminService
