import CoreACService from '../CoreACService'

class GoogleChatService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_CHAT }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Chat' }
  static get humanizedTypeShort () { return 'Chat' }
  static get humanizedLogos () {
    return [
      'google/logo_chat_32px.png',
      'google/logo_chat_48px.png',
      'google/logo_chat_64px.png',
      'google/logo_chat_96px.png',
      'google/logo_chat_128px.png'
    ]
  }
  static get humanizedColor () { return '#47a49b' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return true }
  get supportsUnreadCount () { return false }
  get supportsTrayMessages () { return false }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return false }
  get supportsGuestNotifications () { return true }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return undefined }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://chat.google.com' }
}

export default GoogleChatService
