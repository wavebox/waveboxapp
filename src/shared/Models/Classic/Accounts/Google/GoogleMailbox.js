const CoreMailbox = require('../CoreMailbox')
const GoogleDefaultService = require('./GoogleDefaultService')
const MailboxColors = require('../MailboxColors')
const ServiceFactory = require('../ServiceFactory')

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
      CoreMailbox.SERVICE_TYPES.STORAGE,
      CoreMailbox.SERVICE_TYPES.DOCS,
      CoreMailbox.SERVICE_TYPES.SHEETS,
      CoreMailbox.SERVICE_TYPES.SLIDES,
      CoreMailbox.SERVICE_TYPES.ANALYTICS,
      CoreMailbox.SERVICE_TYPES.VIDEO,
      CoreMailbox.SERVICE_TYPES.SOCIAL,
      CoreMailbox.SERVICE_TYPES.MESSENGER,
      CoreMailbox.SERVICE_TYPES.MUSIC,
      CoreMailbox.SERVICE_TYPES.ADMIN,
      CoreMailbox.SERVICE_TYPES.FI,
      CoreMailbox.SERVICE_TYPES.CLASSROOM,
      CoreMailbox.SERVICE_TYPES.TEAM,
      CoreMailbox.SERVICE_TYPES.PHONE
    ]
  }
  static get defaultServiceTypes () {
    return [
      CoreMailbox.SERVICE_TYPES.DEFAULT,
      CoreMailbox.SERVICE_TYPES.CALENDAR,
      CoreMailbox.SERVICE_TYPES.COMMUNICATION,
      CoreMailbox.SERVICE_TYPES.CONTACTS,
      CoreMailbox.SERVICE_TYPES.NOTES,
      CoreMailbox.SERVICE_TYPES.PHOTOS,
      CoreMailbox.SERVICE_TYPES.STORAGE,
      CoreMailbox.SERVICE_TYPES.DOCS,
      CoreMailbox.SERVICE_TYPES.SHEETS,
      CoreMailbox.SERVICE_TYPES.SLIDES
    ]
  }
  static get defaultColorGmail () { return MailboxColors.GMAIL }
  static get defaultColorGinbox () { return MailboxColors.GINBOX }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat(['auth'])
  }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google' }
  static get humanizedGmailLogos () {
    return [
      'google/logo_gmail_32px.png',
      'google/logo_gmail_48px.png',
      'google/logo_gmail_64px.png',
      'google/logo_gmail_96px.png',
      'google/logo_gmail_128px.png',
      'google/logo_gmail_512px.png'
    ]
  }
  static get humanizedGmailLogo () { return this.humanizedGmailLogos[this.humanizedGmailLogos.length - 1] }
  static get humanizedGmailVectorLogo () { return 'google/logo_gmail_vector.svg' }
  static get humanizedGinboxLogos () {
    return [
      'google/logo_ginbox_32px.png',
      'google/logo_ginbox_48px.png',
      'google/logo_ginbox_64px.png',
      'google/logo_ginbox_96px.png',
      'google/logo_ginbox_128px.png',
      'google/logo_ginbox_512px.png'
    ]
  }
  static get humanizedGinboxLogo () { return this.humanizedGinboxLogos[this.humanizedGinboxLogos.length - 1] }
  static get humanizedGinboxVectorLogo () { return 'google/logo_ginbox_vector.png' }

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
  * @param serviceTypes=defaultList: the default services
  * @param serviceDisplayMode=SIDEBAR: the mode to display the services in
  * @param color=undefined: the color of the mailbox
  * @return a vanilla js object representing the data for this mailbox
  */
  static createJS (id = this.provisionId(), accessMode = GoogleDefaultService.ACCESS_MODES.GINBOX, serviceTypes = this.defaultServiceTypes, serviceDisplayMode = this.SERVICE_DISPLAY_MODES.SIDEBAR, color = undefined) {
    const mailboxJS = super.createJS(id, serviceTypes, serviceDisplayMode, color)
    const defaultService = mailboxJS.services.find((service) => service.type === CoreMailbox.SERVICE_TYPES.DEFAULT)
    defaultService.accessMode = accessMode
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
    const defaultService = sanitized.services.find((service) => service.type === CoreMailbox.SERVICE_TYPES.DEFAULT)
    defaultService.accessMode = accessMode
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
      { },
      this.buildMailboxToServiceMigrationData(serviceData.type))
  }

  /* **************************************************************************/
  // Properties: Wavebox
  /* **************************************************************************/

  get supportsWaveboxAuth () { return true }

  /* **************************************************************************/
  // Properties: Window opening
  /* **************************************************************************/

  get openDriveLinksWithExternalBrowser () {
    // openDriveLinksWithDefaultOpener is a depricated value
    return this._value_('openDriveLinksWithExternalBrowser', this._value_('openDriveLinksWithDefaultOpener', false))
  }

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
          return this.constructor.defaultColorGmail
        } else if (defaultService.accessMode === GoogleDefaultService.ACCESS_MODES.GINBOX) {
          return this.constructor.defaultColorGinbox
        }
      }
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
  get authEmail () { return this.auth.email }
  get authPushToken () { return this.auth.pushToken }

  get isAuthenticationInvalid () { return this.auth.isInvalid }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get email () { return this.__data__.email }
  get displayName () { return this.email }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  get windowOpenModeOverrideRulesets () {
    if (this.openDriveLinksWithExternalBrowser) {
      return [
        {
          url: 'http(s)\\://(*.)google.com(/*)',
          matches: [
            { url: 'http(s)\\://docs.google.com(/*)', mode: 'EXTERNAL' },
            { url: 'http(s)\\://drive.google.com(/*)', mode: 'EXTERNAL' },
            { // Embedded google drive url
              url: 'http(s)\\://(*.)google.com(/*)',
              query: { q: 'http(s)\\://drive.google.com(/*)' },
              mode: 'EXTERNAL'
            },
            { // Embedded google docs url
              url: 'http(s)\\://(*.)google.com(/*)',
              query: { q: 'http(s)\\://docs.google.com(/*)' },
              mode: 'EXTERNAL'
            }
          ]
        }
      ]
    } else {
      return []
    }
  }

  get navigateModeOverrideRulesets () {
    if (this.openDriveLinksWithExternalBrowser) {
      return [
        {
          url: 'http(s)\\://*.google.com(/*)',
          matches: [
            // Convert content popup to external
            { windowType: 'CONTENT_POPUP', url: 'http(s)\\://docs.google.com/document/d/*/edit(*)', mode: 'CONVERT_TO_EXTERNAL' },
            { windowType: 'CONTENT_POPUP', url: 'http(s)\\://docs.google.com/spreadsheets/d/*/edit(*)', mode: 'CONVERT_TO_EXTERNAL' },
            { windowType: 'CONTENT_POPUP', url: 'http(s)\\://docs.google.com/presentation/d/*/edit(*)', mode: 'CONVERT_TO_EXTERNAL' }
          ]
        }
      ]
    } else {
      return []
    }
  }
}

module.exports = GoogleMailbox
