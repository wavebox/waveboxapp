import CoreACService from '../CoreACService'

class GoogleMusicService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_MUSIC }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Play Music' }
  static get humanizedTypeShort () { return 'Music' }
  static get humanizedLogos () {
    return [
      'google/logo_music_32px.png',
      'google/logo_music_48px.png',
      'google/logo_music_64px.png',
      'google/logo_music_96px.png',
      'google/logo_music_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(237, 72, 47)' }

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
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://play.google.com/music' }
}

export default GoogleMusicService
