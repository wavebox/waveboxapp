import CoreACService from '../CoreACService'

class GoogleClassroomService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_CLASSROOM }

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
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return 'Google Classroom' }
  get humanizedTypeShort () { return 'Classroom' }
  get humanizedLogos () {
    return [
      'google/logo_classroom_32px.png',
      'google/logo_classroom_48px.png',
      'google/logo_classroom_64px.png',
      'google/logo_classroom_96px.png',
      'google/logo_classroom_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://classroom.google.com' }
}

export default GoogleClassroomService
