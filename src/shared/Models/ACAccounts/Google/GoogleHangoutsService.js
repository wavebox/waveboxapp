import CoreACService from '../CoreACService'

class GoogleHangoutsService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_HANGOUTS }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return false }
  get supportsUnreadCount () { return true }
  get supportsTrayMessages () { return true }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return true }
  get supportsGuestNotifications () { return false }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return false }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return 'Google Hangouts' }
  get humanizedTypeShort () { return 'Hangouts' }
  get humanizedLogos () {
    return [
      'google/logo_hangouts_32px.png',
      'google/logo_hangouts_48px.png',
      'google/logo_hangouts_64px.png',
      'google/logo_hangouts_96px.png',
      'google/logo_hangouts_128px.png'
    ]
  }
  get humanizedUnreadItemType () { return 'message' }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://hangouts.google.com' }
}

export default GoogleHangoutsService
