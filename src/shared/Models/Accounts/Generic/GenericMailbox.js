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

  get color () {
    if (this.usePageThemeAsColor && this.pageThemeColor) {
      return this.pageThemeColor
    } else {
      return super.color || MailboxColors.GENERIC
    }
  }
  get usePageThemeAsColor () { return this._value_('usePageThemeAsColor', false) }
  get pageThemeColor () { return this._value_('pageThemeColor', undefined) }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get displayName () {
    if (this.usePageTitleAsDisplayName && this.pageTitle) {
      return this.pageTitle
    } else {
      return this._value_('displayName', super.displayName)
    }
  }
  get usePageTitleAsDisplayName () { return this._value_('usePageTitleAsDisplayName', false) }
  get pageTitle () { return this._value_('pageTitle') }

  /* **************************************************************************/
  // Properties : Setup
  /* **************************************************************************/

  get useCustomUserAgent () { return this._value_('useCustomUserAgent', false) }
  get customUserAgentString () { return this._value_('customUserAgentString', '') }
}

module.exports = GenericMailbox
