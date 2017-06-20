const CoreMailbox = require('../CoreMailbox')
const GoogleDefaultService = require('./GoogleDefaultService')
const MailboxColors = require('../MailboxColors')

class GoogleMailbox extends CoreMailbox {
  /* **************************************************************************/
  // Class: Types & Config
  /* **************************************************************************/

  static get type () { return CoreMailbox.MAILBOX_TYPES.GOOGLE }
  static get supportedServiceTypes () {
    return [
      CoreMailbox.SERVICE_TYPES.DEFAULT,
      CoreMailbox.SERVICE_TYPES.CALENDAR,
      CoreMailbox.SERVICE_TYPES.COMMUNICATION,
      CoreMailbox.SERVICE_TYPES.CONTACTS,
      CoreMailbox.SERVICE_TYPES.NOTES,
      CoreMailbox.SERVICE_TYPES.PHOTOS,
      CoreMailbox.SERVICE_TYPES.STORAGE
    ]
  }
  static get defaultServiceTypes () {
    return [
      CoreMailbox.SERVICE_TYPES.DEFAULT,
      CoreMailbox.SERVICE_TYPES.CALENDAR,
      CoreMailbox.SERVICE_TYPES.STORAGE
    ]
  }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google' }
  static get humanizedGmailLogos () {
    return [
      'images/google/logo_gmail_32px.png',
      'images/google/logo_gmail_48px.png',
      'images/google/logo_gmail_64px.png',
      'images/google/logo_gmail_128px.png',
      'images/google/logo_gmail_512px.png'
    ]
  }
  static get humanizedGmailLogo () { return this.humanizedGmailLogos[this.humanizedGmailLogos.length - 1] }
  static get humanizedGmailVectorLogo () { return 'images/google/logo_gmail_vector.svg' }
  static get humanizedGinboxLogos () {
    return [
      'images/google/logo_ginbox_32px.png',
      'images/google/logo_ginbox_48px.png',
      'images/google/logo_ginbox_64px.png',
      'images/google/logo_ginbox_128px.png',
      'images/google/logo_ginbox_512px.png'
    ]
  }
  static get humanizedGinboxLogo () { return this.humanizedGinboxLogos[this.humanizedGinboxLogos.length - 1] }
  static get humanizedGinboxVectorLogo () { return 'images/google/logo_ginbox_vector.png' }

  /**
  * Gets an icon that is closest to the given size
  * @param size: the desired size
  * @return a logo or undefined if none are defined
  */
  static humanizedGmailLogoOfSize (size) {
    return this.humanizedLogoOfSize(size, this.humanizedGmailLogos)
  }

  /**
  * Gets an icon that is closest to the given size
  * @param size: the desired size
  * @return a logo or undefined if none are defined
  */
  static humanizedGinboxLogoOfSize (size) {
    return this.humanizedLogoOfSize(size, this.humanizedGinboxLogos)
  }

  /* **************************************************************************/
  // Class: Creating
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this mailbox
  * @param id=autogenerate: the id of the mailbox
  * @param accessMode=GINBOX: the access mode for this mailbox
  * @return a vanilla js object representing the data for this mailbox
  */
  static createJS (id = this.provisionId(), accessMode = GoogleDefaultService.ACCESS_MODES.GINBOX) {
    const mailboxJS = super.createJS(id)
    const defaultService = mailboxJS.services.find((service) => service.type === CoreMailbox.SERVICE_TYPES.DEFAULT)
    defaultService.accessMode = accessMode
    return mailboxJS
  }

  /**
  * Modifies raw mailbox json for export
  * @param id: the id of the mailbox
  * @param mailboxJS: the js mailbox object
  * @return the modified data
  */
  static prepareForExport (id, mailboxJS) {
    const prep = super.prepareForExport(id, mailboxJS)
    const clearKeys = ['auth']
    clearKeys.forEach((k) => {
      delete prep[k]
    })
    return prep
  }

  /* **************************************************************************/
  // Properties: Wavebox
  /* **************************************************************************/

  get supportsWaveboxAuth () { return true }

  /* **************************************************************************/
  // Properties : Display
  /* **************************************************************************/

  get color () {
    if (super.color) {
      return super.color
    } else {
      const defaultService = this.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT)
      if (defaultService) {
        if (defaultService.accessMode === GoogleDefaultService.ACCESS_MODES.GMAIL) {
          return MailboxColors.GMAIL
        } else if (defaultService.accessMode === GoogleDefaultService.ACCESS_MODES.GINBOX) {
          return MailboxColors.GINBOX
        }
      }
    }
  }

  /* **************************************************************************/
  // Properties : Authentication
  /* **************************************************************************/

  get auth () { return this._value_('auth', {}) }
  get hasAuth () { return Object.keys(this.auth).length !== 0 }
  get authTime () { return this.auth.date }
  get accessToken () { return this.auth.access_token }
  get refreshToken () { return this.auth.refresh_token }
  get authExpiryTime () { return (this.auth.date || 0) + ((this.auth.expires_in || 0) * 999) }
  get authEmail () { return this.auth.email }
  get authPushToken () { return this.auth.pushToken }

  get isAuthenticationInvalid () { return this.auth.isInvalid }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get email () { return this.__data__.email }
  get displayName () { return this.email }
  get unreadCount () { return this.serviceForType(GoogleDefaultService.type).unreadCount }
  get trayMessages () { return this.serviceForType(GoogleDefaultService.type).trayMessages }
  get notifications () { return this.serviceForType(GoogleDefaultService.type).notifications }
}

module.exports = GoogleMailbox
