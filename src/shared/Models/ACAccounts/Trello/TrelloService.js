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
    if (this.homeBoardId !== undefined) {
      const board = this.boards.find((board) => board.id === this.homeBoardId)
      if (board) { return board.shortUrl }
    }
    return 'https://trello.com'
  }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get serviceDisplayName () {
    if (this.fullName && this.username) {
      if (this.fullName === this.username) {
        return this.username
      } else {
        return `${this.username} - ${this.fullName}`
      }
    } else if (this.username) {
      return this.username
    } else {
      return this.humanizedType
    }
  }

  /* **************************************************************************/
  // Properties: Avatar
  /* **************************************************************************/

  get serviceAvatarURL () {
    const data = this._value_('serviceAvatarURL')
    if (data && data.avatarSource === 'upload') {
      return `https://trello-avatars.s3.amazonaws.com/${data.avatarHash}/170.png`
    }
    return undefined
  }
  get serviceAvatarCharacterDisplay () { return this.initials || super.avatarCharacterDisplay }

  /* **************************************************************************/
  // Properties : Trello Boards
  /* **************************************************************************/

  get homeBoardId () { return this._value_('homeBoardId', undefined) }
  get boards () { return this._value_('boards', []) }

  /* **************************************************************************/
  // Properties : Trello details
  /* **************************************************************************/

  get email () { return this._value_('email') }
  get username () { return this._value_('username') }
  get fullName () { return this._value_('fullName') }
  get initials () { return this._value_('initials') }
}

export default TrelloService
