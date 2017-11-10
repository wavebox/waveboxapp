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
      'images/google/logo_classroom_32px.png',
      'images/google/logo_classroom_48px.png',
      'images/google/logo_classroom_64px.png',
      'images/google/logo_classroom_128px.png'
    ]
  }

  /* **************************************************************************/
  // Class: Support
  /* **************************************************************************/

  static get supportsUnreadCount () { return true }
  static get supportsNativeNotifications () { return true }
  static get supportsTrayMessages () { return true }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://classroom.google.com' }
}

module.exports = GoogleClassroomService
