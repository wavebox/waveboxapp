import CoreACService from '../CoreACService'

class GoogleClassroomService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_CLASSROOM }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Classroom' }
  static get humanizedTypeShort () { return 'Classroom' }
  static get humanizedLogos () {
    return [
      'google/logo_classroom_32px.png',
      'google/logo_classroom_48px.png',
      'google/logo_classroom_64px.png',
      'google/logo_classroom_96px.png',
      'google/logo_classroom_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(76, 165, 101)' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return false }
  get supportsUnreadCount () { return false }
  get supportsTrayMessages () { return false }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return false }
  get supportsGuestNotifications () { return false }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return undefined }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://classroom.google.com' }
}

export default GoogleClassroomService
