import CoreACService from '../CoreACService'

class GoogleFiService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_FI }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Fi' }
  static get humanizedTypeShort () { return 'Fi' }
  static get humanizedLogos () {
    return [
      'google/logo_fi_32px.png',
      'google/logo_fi_48px.png',
      'google/logo_fi_64px.png',
      'google/logo_fi_96px.png',
      'google/logo_fi_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(77, 166, 102)' }

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

  get url () { return 'https://fi.google.com' }
}

export default GoogleFiService
