import CoreACService from '../CoreACService'

class TrelloService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.TRELLO }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Trello' }
  static get humanizedLogos () {
    return [
      'trello/logo_32px.png',
      'trello/logo_48px.png',
      'trello/logo_64px.png',
      'trello/logo_96px.png',
      'trello/logo_128px.png',
      'trello/logo_600px.png'
    ]
  }
  static get humanizedUnreadItemType () { return 'notification' }
  static get humanizedColor () { return 'rgb(33, 108, 167)' }

  /* **************************************************************************/
  // Properties: Avatar
  /* **************************************************************************/

  get serviceAvatarURL () {
    // Prior to 4.9.5 the avatar could be stored in a non-string format
    const val = super.serviceAvatarURL
    return typeof (val) === 'string' ? val : undefined
  }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return false }
  get supportsUnreadCount () { return true }
  get supportsTrayMessages () { return true }
  get supportsSyncedDiffNotifications () { return true }
  get supportsNativeNotifications () { return true }
  get supportsGuestNotifications () { return false }
  get supportsSyncWhenSleeping () { return true }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return 'com.trello' }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () {
    return !this.homeBoardId
      ? 'https://trello.com'
      : `https://trello.com/b/${this.homeBoardId}/`
  }

  /* **************************************************************************/
  // Properties : Trello Boards
  /* **************************************************************************/

  get homeBoardId () { return this._value_('homeBoardId', undefined) }
}

export default TrelloService
