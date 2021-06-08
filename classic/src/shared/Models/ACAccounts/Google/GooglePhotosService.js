import CoreACService from '../CoreACService'

class GooglePhotosService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_PHOTOS }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Photos' }
  static get humanizedTypeShort () { return 'Photos' }
  static get humanizedLogos () {
    return [
      'google/logo_photos_32px.png',
      'google/logo_photos_48px.png',
      'google/logo_photos_64px.png',
      'google/logo_photos_96px.png',
      'google/logo_photos_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(139, 195, 74)' }

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

  get url () { return 'https://photos.google.com' }
}

export default GooglePhotosService
