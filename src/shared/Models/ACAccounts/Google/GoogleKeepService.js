import CoreACService from '../CoreACService'

class GoogleKeepService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_KEEP }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Keep' }
  static get humanizedTypeShort () { return 'Keep' }
  static get humanizedLogos () {
    return [
      'google/logo_keep_32px.png',
      'google/logo_keep_48px.png',
      'google/logo_keep_64px.png',
      'google/logo_keep_96px.png',
      'google/logo_keep_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(244, 185, 49)' }

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

  get url () { return 'https://keep.google.com' }
}

export default GoogleKeepService
