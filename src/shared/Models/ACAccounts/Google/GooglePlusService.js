import CoreACService from '../CoreACService'

class GooglePlusService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_PLUS }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Plus' }
  static get humanizedTypeShort () { return 'Google+' }
  static get humanizedLogos () {
    return [
      'google/logo_plus_32px.png',
      'google/logo_plus_48px.png',
      'google/logo_plus_64px.png',
      'google/logo_plus_96px.png',
      'google/logo_plus_128px.png'
    ]
  }
  static get humanizedColor () { return '#dd4b39' }

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

  get url () { return 'https://plus.google.com' }
}

export default GooglePlusService
