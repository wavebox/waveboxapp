const CoreMailbox = require('../CoreMailbox')
const MailboxColors = require('../MailboxColors')
const ServiceFactory = require('../ServiceFactory')

const ACCESS_MODES = Object.freeze({
  OUTLOOK: 'OUTLOOK',
  OFFICE365: 'OFFICE365'
})

class MicrosoftMailbox extends CoreMailbox {
  /* **************************************************************************/
  // Class: Types and config
  /* **************************************************************************/

  static get ACCESS_MODES () { return ACCESS_MODES }
  static get type () { return CoreMailbox.MAILBOX_TYPES.MICROSOFT }
  static get supportedServiceTypes () {
    return [
      CoreMailbox.SERVICE_TYPES.DEFAULT,
      CoreMailbox.SERVICE_TYPES.CALENDAR,
      CoreMailbox.SERVICE_TYPES.CONTACTS,
      CoreMailbox.SERVICE_TYPES.NOTES,
      CoreMailbox.SERVICE_TYPES.STORAGE,
      CoreMailbox.SERVICE_TYPES.DOCS,
      CoreMailbox.SERVICE_TYPES.SHEETS,
      CoreMailbox.SERVICE_TYPES.SLIDES,
      CoreMailbox.SERVICE_TYPES.NOTEBOOK,
      CoreMailbox.SERVICE_TYPES.TEAM,
      CoreMailbox.SERVICE_TYPES.TASK
    ]
  }
  static get defaultServiceTypes () {
    return [
      CoreMailbox.SERVICE_TYPES.DEFAULT,
      CoreMailbox.SERVICE_TYPES.CALENDAR,
      CoreMailbox.SERVICE_TYPES.CONTACTS,
      CoreMailbox.SERVICE_TYPES.NOTES,
      CoreMailbox.SERVICE_TYPES.STORAGE
    ]
  }
  static get defaultColorOutlook () { return MailboxColors.OUTLOOK }
  static get defaultColorOffice365 () { return MailboxColors.OFFICE365 }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat(['auth'])
  }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Microsoft' }
  static get humanizedOutlookLogos () {
    return [
      'microsoft/outlook_logo_32px.png',
      'microsoft/outlook_logo_48px.png',
      'microsoft/outlook_logo_64px.png',
      'microsoft/outlook_logo_96px.png',
      'microsoft/outlook_logo_128px.png',
      'microsoft/outlook_logo_512px.png'
    ]
  }
  static get humanizedOutlookLogo () { return this.humanizedOutlookLogos[this.humanizedOutlookLogos.length - 1] }
  static get humanizedOutlookVectorLogo () { return 'microsoft/outlook_logo_vector.svg' }
  static get humanizedOffice365Logos () {
    return [
      'microsoft/office365_logo_32px.png',
      'microsoft/office365_logo_48px.png',
      'microsoft/office365_logo_64px.png',
      'microsoft/office365_logo_96px.png',
      'microsoft/office365_logo_128px.png',
      'microsoft/office365_logo_512px.png'
    ]
  }
  static get humanizedOffice365Logo () { return this.humanizedOffice365Logos[this.humanizedOffice365Logos.length - 1] }
  static get humanizedOffice365VectorLogo () { return 'microsoft/office365_logo_vector.svg' }

  /**
  * Gets an icon that is closest to the given size
  * @param size: the desired size
  * @return a logo or undefined if none are defined
  */
  static humanizedOutlookLogoOfSize (size) {
    return this.humanizedLogoOfSize(size, this.humanizedOutlookLogo)
  }

  /**
  * Gets an icon that is closest to the given size
  * @param size: the desired size
  * @return a logo or undefined if none are defined
  */
  static humanizedOffice365LogoOfSize (size) {
    return this.humanizedLogoOfSize(size, this.humanizedOffice365Logo)
  }

  /* **************************************************************************/
  // Class: Creating
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this mailbox
  * @param id=autogenerate: the id of the mailbox
  * @param accessMode=OUTLOOK: the access mode for this mailbox
  * @param serviceTypes=defaultList: the default services
  * @param serviceDisplayMode=SIDEBAR: the mode to display the services in
  * @param color=undefined: the color of the mailbox
  * @return a vanilla js object representing the data for this mailbox
  */
  static createJS (id = this.provisionId(), accessMode = ACCESS_MODES.OUTLOOK, serviceTypes = this.defaultServiceTypes, serviceDisplayMode = this.SERVICE_DISPLAY_MODES.SIDEBAR, color = undefined) {
    const mailboxJS = super.createJS(id, serviceTypes, serviceDisplayMode, color)
    mailboxJS.accessMode = accessMode
    return mailboxJS
  }

  /**
  * Sanitizes provisionalJS
  * @param provisionalJS: the javascript to sanitize
  * @param accessMode: the access mode to enforce
  * @return a copy of the javascript, sanitized
  */
  static sanitizeProvisionalJS (provisionalJS, accessMode) {
    const sanitized = super.sanitizeProvisionalJS(provisionalJS)
    sanitized.accessMode = accessMode
    return sanitized
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @override
  */
  modelizeService (serviceData) {
    return ServiceFactory.modelize(
      this.id,
      this.type,
      serviceData,
      { accessMode: this.accessMode, ACCESS_MODES: ACCESS_MODES },
      this.buildMailboxToServiceMigrationData(serviceData.type))
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get ACCESS_MODES () { return ACCESS_MODES }
  get accessMode () { return this._value_('accessMode', ACCESS_MODES.OFFICE) }

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
      switch (this.accessMode) {
        case ACCESS_MODES.OUTLOOK: return this.constructor.defaultColorOutlook
        case ACCESS_MODES.OFFICE365: return this.constructor.defaultColorOffice365
      }
    }
    return super.color || MailboxColors.MICROSOFT
  }
  get avatarURL () {
    switch (this.accessMode) {
      case ACCESS_MODES.OUTLOOK: return `https://apis.live.net/v5.0/${this.userId}/picture?type=large` // This is funky because it's in base64 format but works
      case ACCESS_MODES.OFFICE365: return undefined
    }
  }

  /* **************************************************************************/
  // Properties : Authentication
  /* **************************************************************************/

  get auth () { return this._value_('auth', {}) }
  get hasAuth () { return Object.keys(this.auth).length !== 0 }
  get supportsAuth () { return true }
  get authTime () { return this.auth.date }
  get accessToken () { return this.auth.access_token }
  get refreshToken () { return this.auth.refresh_token }
  get authExpiryTime () { return (this.auth.date || 0) + ((this.auth.expires_in || 0) * 999) }
  get authProtocolVersion () { return this.auth.protocolVersion || 1 }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get email () { return this.__data__.email }
  get userFullName () { return this.__data__.userFullName }
  get userId () { return this.__data__.userId }
  get displayName () { return this.email || this.userFullName }
}

module.exports = MicrosoftMailbox
