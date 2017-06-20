const CoreMailbox = require('../CoreMailbox')
const TrelloDefaultService = require('./TrelloDefaultService')
const MailboxColors = require('../MailboxColors')

class TrelloMailbox extends CoreMailbox {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreMailbox.MAILBOX_TYPES.TRELLO }

  static get humanizedLogos () {
    return [
      'images/trello/logo_32px.png',
      'images/trello/logo_48px.png',
      'images/trello/logo_64px.png',
      'images/trello/logo_128px.png',
      'images/trello/logo_600px.png'
    ]
  }
  static get humanizedVectorLogo () { return 'images/trello/logo_vector.svg' }
  static get humanizedType () { return 'Trello' }
  static get humanizedUnreadItemType () { return 'notification' }

  /**
  * Modifies raw mailbox json for export
  * @param id: the id of the mailbox
  * @param mailboxJS: the js mailbox object
  * @return the modified data
  */
  static prepareForExport (id, mailboxJS) {
    const prep = super.prepareForExport(id, mailboxJS)
    const clearKeys = ['authToken', 'authAppKey']
    clearKeys.forEach((k) => {
      delete prep[k]
    })
    return prep
  }

  /* **************************************************************************/
  // Properties : Display
  /* **************************************************************************/

  get color () { return super.color || MailboxColors.TRELLO }

  /* **************************************************************************/
  // Properties : Authentication
  /* **************************************************************************/

  get authToken () { return this._value_('authToken') }
  get authAppKey () { return this._value_('authAppKey') }
  get hasAuth () { return this.authToken && this.authAppKey }

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
      return '(' + this.fullName + ') ' + this.username
    } else if (this.username) {
      return this.username
    } else {
      return super.displayName
    }
  }
  get unreadCount () { return this.serviceForType(TrelloDefaultService.type).unreadCount }
  get trayMessages () { return this.serviceForType(TrelloDefaultService.type).trayMessages }
  get notifications () { return this.serviceForType(TrelloDefaultService.type).notifications }
}

module.exports = TrelloMailbox
