const CoreMailbox = require('../CoreMailbox')
const MailboxColors = require('../MailboxColors')

class GenericMailbox extends CoreMailbox {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreMailbox.MAILBOX_TYPES.GENERIC }

  static get humanizedLogos () {
    return [
      'images/generic/logo_32px.png',
      'images/generic/logo_48px.png',
      'images/generic/logo_64px.png',
      'images/generic/logo_128px.png',
      'images/generic/logo_512px.png'
    ]
  }
  static get humanizedVectorLogo () { return 'images/generic/logo_vector.svg' }
  static get humanizedType () { return 'Generic' }
  static get humanizedUnreadItemType () { return 'notification' }

  /* **************************************************************************/
  // Properties : Display
  /* **************************************************************************/

  get color () { return super.color || MailboxColors.GENERIC }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get displayName () { return this.__data__.displayName || super.displayName }
}

module.exports = GenericMailbox
