import CoreACService from '../CoreACService'

class GoogleVoiceService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_VOICE }

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

  get humanizedType () { return 'Google Voice' }
  get humanizedTypeShort () { return 'Voice' }
  get humanizedLogos () {
    return [
      'google/logo_voice_32px.png',
      'google/logo_voice_48px.png',
      'google/logo_voice_64px.png',
      'google/logo_voice_96px.png',
      'google/logo_voice_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://voice.google.com' }
}

export default GoogleVoiceService
