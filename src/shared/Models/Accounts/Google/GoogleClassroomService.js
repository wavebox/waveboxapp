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
  static get supportsgGuestNotifications () { return true }

  /* **************************************************************************/
  // Class: Creation
  /* **************************************************************************/
  
  /**
  * Creates a blank js object that can be used to instantiate this service
  * @return a vanilla js object representing the data for this service
  */
  static createJS() {
    return Object.assign({}, super.createJS(), {
      sleepable: false
    })
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://classroom.google.com' }
}

module.exports = GoogleClassroomService
