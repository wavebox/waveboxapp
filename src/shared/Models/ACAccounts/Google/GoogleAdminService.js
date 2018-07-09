import CoreACService from '../CoreACService'

class GoogleAdminService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_ADMIN }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Admin' }
  static get humanizedTypeShort () { return 'Admin' }
  static get humanizedLogos () {
    return [
      'google/logo_admin_32px.png',
      'google/logo_admin_48px.png',
      'google/logo_admin_64px.png',
      'google/logo_admin_96px.png',
      'google/logo_admin_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(73, 137, 244)' }

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

  get url () { return 'https://admin.google.com' }
}

export default GoogleAdminService
