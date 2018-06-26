import CoreACService from '../CoreACService'

class GoogleMusicService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_MUSIC }

  /* **************************************************************************/
  // Class: Creation
  /* **************************************************************************/

  /**
  * @overwrite
  */
  static createJS (...args) {
    return {
      ...super.createJS(...args),
      sleepable: false
    }
  }

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

  get humanizedType () { return 'Google Play Music' }
  get humanizedTypeShort () { return 'Music' }
  get humanizedLogos () {
    return [
      'google/logo_music_32px.png',
      'google/logo_music_48px.png',
      'google/logo_music_64px.png',
      'google/logo_music_96px.png',
      'google/logo_music_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://play.google.com/music' }
}

export default GoogleMusicService
