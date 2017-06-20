const Model = require('../Model')
const SERVICE_TYPES = require('./ServiceTypes')
const MAILBOX_TYPES = require('./MailboxTypes')
const ServiceFactory = require('./ServiceFactory')
const uuid = require('uuid')

const SERVICE_DISPLAY_MODES = Object.freeze({
  SIDEBAR: 'SIDEBAR',
  TOOLBAR: 'TOOLBAR'
})
const SERVICE_TOOLBAR_ICON_LAYOUTS = Object.freeze({
  LEFT_ALIGN: 'LEFT_ALIGN',
  RIGHT_ALIGN: 'RIGHT_ALIGN'
})

const LOGO_NAME_RE = new RegExp(/^(.*?)([0-9]+)(px)(.*)$/)

class CoreMailbox extends Model {
  /* **************************************************************************/
  // Class : Types & Config
  /* **************************************************************************/

  static get MAILBOX_TYPES () { return MAILBOX_TYPES }
  static get SERVICE_TYPES () { return SERVICE_TYPES }
  static get SERVICE_DISPLAY_MODES () { return SERVICE_DISPLAY_MODES }
  static get SERVICE_TOOLBAR_ICON_LAYOUTS () { return SERVICE_TOOLBAR_ICON_LAYOUTS }
  static get type () { return MAILBOX_TYPES.UNKNOWN }
  static get supportedServiceTypes () { return [SERVICE_TYPES.DEFAULT] }
  static get defaultServiceTypes () { return [SERVICE_TYPES.DEFAULT] }
  static get supportsAdditionalServiceTypes () { return this.supportedServiceTypes.length > 1 }
  static get userAgentChanges () { return [] }
  static get supportsUnreadActivity () { return false }
  static get supportsUnreadCount () { return true }
  static get supportsNativeNotifications () { return true }

  /* **************************************************************************/
  // Class : Humanized
  /* **************************************************************************/

  static get humanizedType () { return undefined }
  static get humanizedLogos () { return [] }
  static get humanizedLogo () { return this.humanizedLogos[this.humanizedLogos.length - 1] }
  static get humanizedVectorLogo () { return undefined }

  /**
  * Gets an icon that is closest to the given size
  * @param size: the desired size
  * @return logos=this.humanizedLogos: the humanized logos
  * @return a logo or undefined if none are defined
  */
  static humanizedLogoOfSize (size, logos = this.humanizedLogos) {
    const index = logos.map((icon) => {
      return [icon, (LOGO_NAME_RE.exec(icon) || [])[2] || 0]
    })

    const closest = index.reduce((prev, curr) => {
      return (Math.abs(curr[1] - size) < Math.abs(prev[1] - size) ? curr : prev)
    })
    return closest ? closest[0] : undefined
  }
  static get humanizedUnreadItemType () { return 'message' }

  /* **************************************************************************/
  // Class : Creating
  /* **************************************************************************/

  /**
  * Provisions a new id
  * @return a new id for a mailbox
  */
  static provisionId () { return uuid.v4() }

  /**
  * Creates a blank js object that can used to instantiate this mailbox
  * @param id=autogenerate: the id of the mailbox
  * @return a vanilla js object representing the data for this mailbox
  */
  static createJS (id = this.provisionId()) {
    return {
      id: id,
      type: this.type,
      changedTime: new Date().getTime(),
      services: this.defaultServiceTypes.map((serviceType) => {
        const ServiceClass = ServiceFactory.getClass(this.type, serviceType)
        return ServiceClass ? ServiceClass.createJS() : {}
      })
    }
  }

  /**
  * Modifies raw mailbox json for export
  * @param id: the id of the mailbox
  * @param mailboxJS: the js mailbox object
  * @return the modified data
  */
  static prepareForExport (id, mailboxJS) {
    return JSON.parse(JSON.stringify(mailboxJS))
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param id: the id ofthe tab
  * @param data: the data of the tab
  */
  constructor (id, data) {
    super(data)
    this.__id__ = id

    // Inject any default model data to the json
    if (!this.__data__.services || !this.__data__.services.length) {
      this.__data__.services = this.constructor.defaultServiceTypes.map((serviceType) => {
        return { type: serviceType }
      })
    }

    // Modelize services
    this.__services__ = data.services.map((service) => {
      return this.modelizeService(service)
    })
  }

  /**
  * Modelizes a service for this mailbox
  * @param serviceData: the data for the service
  * @return a modelled version of the service
  */
  modelizeService (serviceData) {
    return ServiceFactory.modelize(this.id, this.type, serviceData)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.__id__ }
  get changedTime () { return this.__data__.changedTime || 0 }
  get versionedId () { return this.id + ':' + this.changedTime }
  get type () { return this.constructor.type }
  get partition () { return this.id }
  get artificiallyPersistCookies () { return this._value_('artificiallyPersistCookies', false) }
  get supportsUnreadActivity () { return this.constructor.supportsUnreadActivity }
  get supportsUnreadCount () { return this.constructor.supportsUnreadCount }
  get supportsNativeNotifications () { return this.constructor.supportsNativeNotifications }

  /* **************************************************************************/
  // Properties: Wavebox
  /* **************************************************************************/

  get supportsWaveboxAuth () { return false }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return this.constructor.humanizedType }
  get humanizedLogos () { return this.constructor.humanizedLogos }
  get humanizedLogo () { return this.constructor.humanizedLogo }
  get humanizedUnreadItemType () { return this.constructor.humanizedUnreadItemType }

  /* **************************************************************************/
  // Properties: Services
  /* **************************************************************************/

  get supportedServiceTypes () { return this.constructor.supportedServiceTypes }
  get defaultServiceTypes () { return this.constructor.defaultServiceTypes }
  get supportsAdditionalServiceTypes () { return this.constructor.supportsAdditionalServiceTypes }
  get enabledServices () { return this.__services__ }
  get enabledServiceTypes () { return this.enabledServices.map((service) => service.type) }
  get disabledServiceTypes () {
    const enabled = new Set(this.enabledServiceTypes)
    return this.supportedServiceTypes.filter((type) => !enabled.has(type))
  }
  get hasAdditionalServices () { return this.enabledServices.length > 1 }
  get additionalServiceTypes () {
    return this.enabledServiceTypes.filter((serviceType) => serviceType !== SERVICE_TYPES.DEFAULT)
  }

  /**
  * @param type: the type of service
  * @return the service or undefined
  */
  serviceForType (type) {
    return this.enabledServices.find((service) => service.type === type)
  }

  /* **************************************************************************/
  // Properties : Display
  /* **************************************************************************/

  get avatarURL () { return this.__data__.avatar }
  get avatarCharacterDisplay () { return undefined }
  get hasCustomAvatar () { return this.__data__.customAvatar !== undefined }
  get customAvatarId () { return this.__data__.customAvatar }
  get hasServiceLocalAvatar () { return this.__data__.serviceLocalAvatar !== undefined }
  get serviceLocalAvatarId () { return this.__data__.serviceLocalAvatar }
  get color () { return this.__data__.color }
  get unreadBadgeColor () { return this._value_('unreadBadgeColor', 'rgba(238, 54, 55, 0.95)') }
  get showAvatarColorRing () { return this._value_('showAvatarColorRing', true) }
  get serviceDisplayMode () { return this._value_('serviceDisplayMode', SERVICE_DISPLAY_MODES.SIDEBAR) }
  get serviceToolbarIconLayout () { return this._value_('serviceToolbarIconLayout', SERVICE_TOOLBAR_ICON_LAYOUTS.RIGHT_ALIGN) }
  get collapseSidebarServices () { return this._value_('collapseSidebarServices', false) }
  get showSleepableServiceIndicator () { return this._value_('showSleepableServiceIndicator', true) }

  /* **************************************************************************/
  // Properties : Badges
  /* **************************************************************************/

  get showUnreadBadge () { return this._value_('showUnreadBadge', true) }
  get unreadCountsTowardsAppUnread () { return this._value_('unreadCountsTowardsAppUnread', true) }
  get showUnreadActivityBadge () { return this._value_('showUnreadActivityBadge', true) }
  get unreadActivityCountsTowardsAppUnread () { return this._value_('unreadActivityCountsTowardsAppUnread', true) }

  /* **************************************************************************/
  // Properties : Notifications
  /* **************************************************************************/

  get showNotifications () { return this._value_('showNotifications', true) }
  get showAvatarInNotifications () { return this._value_('showAvatarInNotifications', true) }
  get notificationsSound () { return this._value_('notificationsSound', undefined) }

  /* **************************************************************************/
  // Properties : Authentication
  /* **************************************************************************/

  get isAuthenticationInvalid () { return false }
  get hasAuth () { return true }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get displayName () { return this.id }
  get unreadCount () { return 0 }
  get hasUnreadActivity () { return false }
  get trayMessages () { return [] }
  get notifications () { return [] }
}

module.exports = CoreMailbox
