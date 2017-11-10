const GoogleService = require('./GoogleService')

class GoogleClassroomService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.CLASSROOM }
  static get humanizedType () { return 'Google Classroom' }
  static get humanizedTypeShort () { return 'Classroom' }
  static get humanizedLogos () {
      /* TODO try to find 128px of icon*/
    return [
      'images/google/logo_classroom_32px.png',
      'images/google/logo_classroom_48px.png',
      'images/google/logo_classroom_64px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://classroom.google.com' }
}

module.exports = GoogleClassroomService
