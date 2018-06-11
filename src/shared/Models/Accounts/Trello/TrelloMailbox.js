const CoreMailbox = require('../CoreMailbox')
const MailboxColors = require('../MailboxColors')

class TrelloMailbox extends CoreMailbox {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreMailbox.MAILBOX_TYPES.TRELLO }

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
  static get humanizedVectorLogo () { return 'trello/logo_vector.svg' }
  static get humanizedType () { return 'Trello' }
  static get defaultColor () { return MailboxColors.TRELLO }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat(['authToken', 'authAppKey'])
  }

  /* **************************************************************************/
  // Properties : Authentication
  /* **************************************************************************/

  get authToken () { return this._value_('authToken') }
  get authAppKey () { return this._value_('authAppKey') }
  get hasAuth () { return this.authToken && this.authAppKey }
  get supportsAuth () { return true }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get email () { return this.__data__.email }
  get username () { return this.__data__.username }
  get fullName () { return this.__data__.fullName }
  get initials () { return this.__data__.initials }
  get avatarURL () {
    if (this.__data__.avatar) {
      if (this.__data__.avatar.avatarSource === 'upload') {
        return 'https://trello-avatars.s3.amazonaws.com/' + this.__data__.avatar.avatarHash + '/170.png'
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }
  get avatarCharacterDisplay () { return this.initials || super.avatarCharacterDisplay }
  get displayName () {
    if (this.fullName && this.username) {
      if (this.fullName === this.username) {
        return this.username
      } else {
        return `${this.username} - ${this.fullName}`
      }
    } else if (this.username) {
      return this.username
    } else {
      return super.displayName
    }
  }
}

module.exports = TrelloMailbox
