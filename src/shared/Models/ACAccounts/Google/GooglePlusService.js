import CoreACService from '../CoreACService'

class GooglePlusService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_PLUS }

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

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return 'Google Plus' }
  get humanizedTypeShort () { return 'Google+' }
  get humanizedLogos () {
    return [
      'google/logo_plus_32px.png',
      'google/logo_plus_48px.png',
      'google/logo_plus_64px.png',
      'google/logo_plus_96px.png',
      'google/logo_plus_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://plus.google.com' }
}

export default GooglePlusService
