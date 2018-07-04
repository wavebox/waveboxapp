const GoogleService = require('./GoogleService')

class GoogleClassroomService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.CLASSROOM }
  static get humanizedType () { return 'Google Classroom' }
  static get humanizedTypeShort () { return 'Classroom' }
  static get humanizedUnreadItemType () { return 'message' }
  static get humanizedLogos () {
    return [
      'google/logo_classroom_32px.png',
      'google/logo_classroom_48px.png',
      'google/logo_classroom_64px.png',
      'google/logo_classroom_96px.png',
      'google/logo_classroom_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://classroom.google.com' }
}

module.exports = GoogleClassroomService
