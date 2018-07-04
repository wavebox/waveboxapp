const Model = require('../../Model')
const SERVICE_TYPES = require('./ServiceTypes')
const PROTOCOL_TYPES = require('./ProtocolTypes')
const { MAILBOX_SLEEP_WAIT } = require('../../../constants')
const CoreServiceGuestConfig = require('./CoreServiceGuestConfig')

const RELOAD_BEHAVIOURS = Object.freeze({
  RELOAD: 'RELOAD',
  RESET_URL: 'RESET_URL'
})

class CoreService extends Model {
  /* **************************************************************************/
  // Class: Config & Types
  /* **************************************************************************/

  static get SERVICE_TYPES () { return SERVICE_TYPES }
  static get PROTOCOL_TYPES () { return PROTOCOL_TYPES }
  static get RELOAD_BEHAVIOURS () { return RELOAD_BEHAVIOURS }
  static get type () { return SERVICE_TYPES.UNKNOWN }
  static get excludedExportKeys () {
    return [
      'lastUrl',
      '::guestConfig:hasUnreadActivity',
      '::guestConfig:unreadCount',
      '::guestConfig:trayMessages'
    ]
  }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return undefined }
  static get humanizedTypeShort () { return this.humanizedType }
  static get humanizedLogos () { return [] }
  static get humanizedLogo () { return this.humanizedLogos[this.humanizedLogos.length - 1] }
  static get humanizedUnreadItemType () { return 'message' }

  /**
  * Gets the logo at a specific size
  * @param size: the prefered size
  * @return the logo with the size or a default one
  */
  static humanizedLogoAtSize (size) { return this.getLogoAtSize(this.humanizedLogos, size) }

  /**
  * Gets a logo at a specific size
  * @param logos: the list of logos to get from
  * @param size: the prefered size
  * @return the logo with the size or a default one
  */
  static getLogoAtSize (logos, size) {
    return logos.find((l) => l.indexOf(`${size}px`) !== -1) || logos.slice(-1)[0]
  }

  /* **************************************************************************/
  // Class: Creation
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this service
  * @return a vanilla js object representing the data for this service
  */
  static createJS () {
    return { type: this.type }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param parentId: the id of the mailbox
  * @param data: the data of the service
  * @param metadata={}: metadata for this service to use
  * @param mailboxMigrationData={}: data that's been migrated from the mailbox
  */
  constructor (parentId, data, metadata = {}, mailboxMigrationData = {}) {
    super(data)
    this.__parentId__ = parentId
    this.__metadata__ = metadata
    this.__mailboxMigrationData__ = mailboxMigrationData
    this.__guestConfig__ = new CoreServiceGuestConfig(data)
  }

  /**
  * Modifies raw json for export
  * @return copy of plain data that is safe to export
  */
  prepareForExport () {
    const clone = this.cloneData()
    this.constructor.excludedExportKeys.forEach((k) => {
      delete clone[k]
    })
    return clone
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get parentId () { return this.__parentId__ }
  get type () { return this.constructor.type }
  get sleepable () { return this._value_('sleepable', true) }
  get sleepableTimeout () { return this._value_('sleepableTimeout', MAILBOX_SLEEP_WAIT) }
  get hasNavigationToolbar () { return false }
  get reloadBehaviour () { return RELOAD_BEHAVIOURS.RESET_URL }
  get hasSeenSleepableWizard () { return this._value_('hasSeenSleepableWizard', false) }

  /* **************************************************************************/
  // Properties: Url
  /* **************************************************************************/

  get url () { return undefined }
  get lastUrl () {
    const value = this._value_('lastUrl', {})
    if (value && value.baseUrl === this.url && value.url && value.url !== 'about:blank') {
      return value.url
    } else {
      return undefined
    }
  }
  get restoreLastUrlDefault () { return false }
  get restoreLastUrl () { return this._value_('restoreLastUrl', this.restoreLastUrlDefault) }
  get restorableUrl () {
    if (this.restoreLastUrl) {
      return this.lastUrl || this.url
    } else {
      return this.url
    }
  }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return false }
  get supportsUnreadCount () { return false }
  get supportsTrayMessages () { return false }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return false }
  get supportsGuestNotifications () { return false }
  get supportsSyncWhenSleeping () { return false }
  get supportsSync () {
    return [
      this.supportsUnreadActivity,
      this.supportsUnreadCount,
      this.supportsNativeNotifications,
      this.supportsGuestNotifications
    ].find((s) => s) || false
  }
  get supportsGuestConfig () { return false }

  /* **************************************************************************/
  // Properties: Protocols & actions
  /* **************************************************************************/

  get supportedProtocols () { return new Set() }
  get supportsCompose () { return false }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return this.constructor.humanizedType }
  get humanizedTypeShort () { return this.constructor.humanizedTypeShort }
  get humanizedLogos () { return this.constructor.humanizedLogos }
  get humanizedLogo () { return this.constructor.humanizedLogo }
  get humanizedUnreadItemType () { return this.constructor.humanizedUnreadItemType }

  /**
  * Gets the logo at a specific size
  * @param size: the prefered size
  * @return the logo with the size or a default one
  */
  humanizedLogoAtSize (size) { return this.constructor.getLogoAtSize(this.humanizedLogos, size) }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get unreadBadgeColor () { return this._migrationValue_('unreadBadgeColor', 'rgba(238, 54, 55, 0.95)') }

  /* **************************************************************************/
  // Properties : Badges
  /* **************************************************************************/

  get showUnreadBadge () { return this._migrationValue_('showUnreadBadge', true) }
  get unreadCountsTowardsAppUnread () { return this._migrationValue_('unreadCountsTowardsAppUnread', true) }
  get showUnreadActivityBadge () { return this._migrationValue_('showUnreadActivityBadge', true) }
  get unreadActivityCountsTowardsAppUnread () { return this._migrationValue_('unreadActivityCountsTowardsAppUnread', true) }

  /* **************************************************************************/
  // Properties : Notifications
  /* **************************************************************************/

  get showNotifications () { return this._migrationValue_('showNotifications', true) }
  get showAvatarInNotifications () { return this._migrationValue_('showAvatarInNotifications', true) }
  get notificationsSound () { return this._migrationValue_('notificationsSound', undefined) }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get unreadCount () { return this.supportsGuestConfig ? this.guestConfig.unreadCount : 0 }
  get hasUnreadActivity () { return this.supportsGuestConfig ? this.guestConfig.hasUnreadActivity : false }
  get trayMessages () { return this.supportsGuestConfig ? this.guestConfig.trayMessages : [] }
  get notifications () { return [] }

  /* **************************************************************************/
  // Properties : Custom injectables
  /* **************************************************************************/

  get customCSS () { return this.__data__.customCSS }
  get hasCustomCSS () { return !!this.customCSS }
  get customJS () { return this.__data__.customJS }
  get hasCustomJS () { return !!this.customJS }

  /* **************************************************************************/
  // Properties: Adaptors
  /* **************************************************************************/

  get adaptors () { return [] }
  get guestConfig () { return this.__guestConfig__ }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  get mergeChangesetOnActive () { return undefined }

  /**
  * Looks to see if the input event should be prevented
  * @param input: the input info
  * @return true if the input should be prevented, false otherwise
  */
  shouldPreventInputEvent (input) {
    return false
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Gets the value from the data, but also checks the metadata for a fallback value before returning the default value
  * @param key: the key to get
  * @param defaultValue: the value to return if undefined
  * @return the value or defaultValue
  */
  _migrationValue_ (key, defaultValue) {
    if (this.__data__[key] !== undefined) { return this.__data__[key] }
    if (this.__mailboxMigrationData__[key] !== undefined) { return this.__mailboxMigrationData__[key] }
    return defaultValue
  }
}

module.exports = CoreService
