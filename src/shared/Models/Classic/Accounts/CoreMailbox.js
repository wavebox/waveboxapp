const Model = require('../../Model')
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

const DEFAULT_WINDOW_OPEN_MODES = Object.freeze({
  BROWSER: 'BROWSER',
  WAVEBOX: 'WAVEBOX'
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
  static get DEFAULT_WINDOW_OPEN_MODES () { return DEFAULT_WINDOW_OPEN_MODES }
  static get type () { return MAILBOX_TYPES.UNKNOWN }
  static get supportedServiceTypes () { return [SERVICE_TYPES.DEFAULT] }
  static get defaultServiceTypes () { return [SERVICE_TYPES.DEFAULT] }
  static get supportsAdditionalServiceTypes () { return this.supportedServiceTypes.length > 1 }
  static get defaultColor () { return undefined }
  static get isIntegrated () { return true }
  static get excludedExportKeys () { return [] }

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
  * @param serviceTypes=defaultList: the default services
  * @param serviceDisplayMode=SIDEBAR: the mode to display the services in
  * @param color=undefined: the color of the mailbox
  * @return a vanilla js object representing the data for this mailbox
  */
  static createJS (id = this.provisionId(), serviceTypes = this.defaultServiceTypes, serviceDisplayMode = this.SERVICE_DISPLAY_MODES.TOOLBAR, color = undefined) {
    return {
      id: id,
      type: this.type,
      changedTime: new Date().getTime(),
      serviceDisplayMode: serviceDisplayMode,
      serviceToolbarIconLayout: SERVICE_TOOLBAR_ICON_LAYOUTS.LEFT_ALIGN, // Make this the default for new accounts
      color: color,
      services: serviceTypes.map((serviceType) => {
        const ServiceClass = ServiceFactory.getClass(this.type, serviceType)
        return ServiceClass ? ServiceClass.createJS() : { type: serviceType }
      })
    }
  }

  /**
  * Sanitizes provisionalJS
  * @param provisionalJS: the javascript to sanitize
  * @return a copy of the javascript, sanitized
  */
  static sanitizeProvisionalJS (provisionalJS) {
    const sanitized = JSON.parse(JSON.stringify(provisionalJS))
    sanitized.id = sanitized.id || this.provisionId()
    sanitized.type = this.type
    sanitized.changedTime = new Date().getTime()
    return sanitized
  }

  /**
  * Applies any experiments to the provisional js
  * @param provisionalJS: the javascript to apply to
  * @param experiments: the experiments dictionary to use
  * @return a copy of the javascript updated
  */
  static applyExperimentsToProvisionalJS (provisionalJS, experiments) {
    const cpy = JSON.parse(JSON.stringify(provisionalJS))

    if (experiments.autoSleepIntegratedApp === true && this.isIntegrated) {
      const defaultService = (cpy.services || []).find((s) => s.type === SERVICE_TYPES.DEFAULT)
      if (defaultService) { defaultService.sleepable = true } // There should always be a default service, so don't create one
    }

    return cpy
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param id: the id ofthe tab
  * @param data: the data of the tab
  * @param expando={}: additional items to write into this on creatiton time
  */
  constructor (id, data, expando = {}) {
    super(data)
    this.__id__ = id

    // Write expando properties
    Object.keys(expando).forEach((k) => {
      this[k] = expando[k]
    })

    // If we don't have default model data, inject it into the json
    if (!this.__data__.services || !this.__data__.services.length) {
      const sanitizedData = JSON.parse(JSON.stringify(this.__data__))
      sanitizedData.services = this.constructor.defaultServiceTypes.map((serviceType) => {
        return { type: serviceType }
      })
      this.__data__ = Object.freeze(sanitizedData)
    }

    // Modelize services
    this.__services__ = this.__data__.services.map((service) => {
      return this.modelizeService(service)
    })
  }

  /**
  * Modelizes a service for this mailbox
  * @param serviceData: the data for the service
  * @return a modelled version of the service
  */
  modelizeService (serviceData) {
    return ServiceFactory.modelize(
      this.id,
      this.type,
      serviceData,
      undefined,
      this.buildMailboxToServiceMigrationData(serviceData.type)
    )
  }

  /**
  * Makes an object of settings that can be pushed down into the service.
  * These are predominantly settings that were stored on the mailbox and are
  * now part of the settings
  * @param targetServiceType: the type of service it's being built for
  * @return a metadata object that the service can use
  */
  buildMailboxToServiceMigrationData (targetServiceType) {
    return Object.assign({
      unreadBadgeColor: this.__data__.unreadBadgeColor,
      showAvatarInNotifications: this.__data__.showAvatarInNotifications,
      notificationsSound: this.__data__.notificationsSound
    }, targetServiceType === SERVICE_TYPES.DEFAULT ? {
      showUnreadBadge: this.__data__.showUnreadBadge,
      unreadCountsTowardsAppUnread: this.__data__.unreadCountsTowardsAppUnread,
      showUnreadActivityBadge: this.__data__.showUnreadActivityBadge,
      unreadActivityCountsTowardsAppUnread: this.__data__.unreadActivityCountsTowardsAppUnread,
      showNotifications: this.__data__.showNotifications
    } : undefined)
  }

  /**
  * Modifies raw json for export
  * @return copy of plain data that is safe to export
  */
  prepareForExport () {
    const clone = this.cloneData()
    clone.services = this.enabledServices.map((service) => {
      return service.prepareForExport()
    })
    this.constructor.excludedExportKeys.forEach((k) => {
      delete clone[k]
    })
    return clone
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
  get isIntegrated () { return this.constructor.isIntegrated }

  /* **************************************************************************/
  // Properties: Window opening
  /* **************************************************************************/

  get defaultWindowOpenMode () { return this._value_('defaultWindowOpenMode', DEFAULT_WINDOW_OPEN_MODES.BROWSER) }

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
  get defaultService () { return this.serviceForType(SERVICE_TYPES.DEFAULT) }
  get additionalServices () { return this.additionalServiceTypes.map((type) => this.serviceForType(type)) }

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
  get color () { return this._value_('color', this.constructor.defaultColor) }
  get showAvatarColorRing () { return this._value_('showAvatarColorRing', true) }
  get serviceDisplayMode () { return this._value_('serviceDisplayMode', SERVICE_DISPLAY_MODES.SIDEBAR) }
  get serviceToolbarIconLayout () { return this._value_('serviceToolbarIconLayout', SERVICE_TOOLBAR_ICON_LAYOUTS.RIGHT_ALIGN) }
  get collapseSidebarServices () { return this._value_('collapseSidebarServices', false) }
  get showSleepableServiceIndicator () { return this._value_('showSleepableServiceIndicator', true) }

  /* **************************************************************************/
  // Properties : Badge
  /* **************************************************************************/

  get showCumulativeSidebarUnreadBadge () {
    // Migrate from old settings
    return this._value_('showCumulativeSidebarUnreadBadge', this._value_('showUnreadBadge', true))
  }
  get cumulativeSidebarUnreadBadgeColor () {
    // Migrate from old settings
    return this._value_('cumulativeSidebarUnreadBadgeColor', this._value_('unreadBadgeColor', 'rgba(238, 54, 55, 0.95)'))
  }

  /* **************************************************************************/
  // Properties : Authentication
  /* **************************************************************************/

  get isAuthenticationInvalid () { return false }
  get hasAuth () { return true }
  get supportsAuth () { return false }

  /* **************************************************************************/
  // Properties : Useragent
  /* **************************************************************************/

  get useCustomUserAgent () { return false }
  get customUserAgentString () { return '' }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get displayName () { return this.id }

  /**
  * Gets the unread count
  * @param defaultServiceOnly=false: set to true to only return for the default service
  * @return the total unread count
  */
  getUnreadCount (defaultServiceOnly = false) {
    const services = defaultServiceOnly ? [this.defaultService] : this.enabledServices
    return services.reduce((acc, service) => {
      if (service.supportsUnreadCount && service.showUnreadBadge) {
        return acc + service.unreadCount
      } else {
        return acc
      }
    }, 0)
  }

  /**
  * Gets the unread count for the app badge
  * @param defaultServiceOnly=false: set to true to only return for the default service
  * @return the total unread count for the app badge
  */
  getUnreadCountForAppBadge (defaultServiceOnly = false) {
    const services = defaultServiceOnly ? [this.defaultService] : this.enabledServices
    return services.reduce((acc, service) => {
      if (service.supportsUnreadCount && service.unreadCountsTowardsAppUnread) {
        return acc + service.unreadCount
      } else {
        return acc
      }
    }, 0)
  }

  /**
  * Gets the unread activity
  * @param defaultServiceOnly=false: set to true to only return for the default service
  * @return true if there is any unread activity
  */
  getHasUnreadActivity (defaultServiceOnly = false) {
    const services = defaultServiceOnly ? [this.defaultService] : this.enabledServices
    return !!services.find((service) => {
      return service.supportsUnreadActivity && service.showUnreadActivityBadge && service.hasUnreadActivity
    })
  }

  /**
  * Gets the unread activity
  * @param defaultServiceOnly=false: set to true to only return for the default service
  * @return the total unread actibity for the app badge
  */
  getUnreadActivityForAppbadge (defaultServiceOnly = false) {
    const services = defaultServiceOnly ? [this.defaultService] : this.enabledServices
    return !!services.find((service) => {
      return service.supportsUnreadActivity && service.unreadActivityCountsTowardsAppUnread && service.hasUnreadActivity
    })
  }

  /**
  * Gets the tray messages
  * @param defaultServiceOnly=false: set to true to only return for the default service
  * @return all the tray messages as an array
  */
  getTrayMessages (defaultServiceOnly = false) {
    const services = defaultServiceOnly ? [this.defaultService] : this.enabledServices
    return services.reduce((acc, service) => {
      if (service.supportsTrayMessages) {
        return acc.concat(service.trayMessages)
      } else {
        return acc
      }
    }, [])
  }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  get windowOpenModeOverrideRulesets () { return [] }
  get hasWindowOpenModeRulesetOverrides () { return this.windowOpenModeOverrideRulesets && this.windowOpenModeOverrideRulesets.length }
  get navigateModeOverrideRulesets () { return [] }
  get hasNavigateModeOverrideRulesets () { return this.navigateModeOverrideRulesets && this.navigateModeOverrideRulesets.length }
}

module.exports = CoreMailbox
