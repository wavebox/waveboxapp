const Model = require('../Model')
const SERVICE_TYPES = require('./ServiceTypes')
const PROTOCOL_TYPES = require('./ProtocolTypes')
const { MAILBOX_SLEEP_WAIT } = require('../../constants')

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
  static get reloadBehaviour () { return RELOAD_BEHAVIOURS.RESET_URL }

  /* **************************************************************************/
  // Class: Support
  /* **************************************************************************/

  static get supportsUnreadActivity () { return false }
  static get supportsUnreadCount () { return false }
  static get supportsTrayMessages () { return false }
  static get supportsSyncedDiffNotifications () { return false }
  static get supportsNativeNotifications () { return false }
  static get supportsGuestNotifications () { return false }
  static get supportsSyncWhenSleeping () { return false }
  static get supportsSync () {
    return [
      this.supportsUnreadActivity,
      this.supportsUnreadCount,
      this.supportsNativeNotifications,
      this.supportsGuestNotifications
    ].find((s) => s) || false
  }
  static get mergeChangesetOnActive () { return undefined }

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
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get parentId () { return this.__parentId__ }
  get type () { return this.constructor.type }
  get sleepable () { return this._value_('sleepable', true) }
  get sleepableTimeout () { return this._value_('sleepableTimeout', MAILBOX_SLEEP_WAIT) }
  get hasNavigationToolbar () { return false }
  get reloadBehaviour () { return this.constructor.reloadBehaviour }
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

  get supportsUnreadActivity () { return this.constructor.supportsUnreadActivity }
  get supportsUnreadCount () { return this.constructor.supportsUnreadCount }
  get supportsTrayMessages () { return this.constructor.supportsTrayMessages }
  get supportsSyncedDiffNotifications () { return this.constructor.supportsSyncedDiffNotifications }
  get supportsNativeNotifications () { return this.constructor.supportsNativeNotifications }
  get supportsGuestNotifications () { return this.constructor.supportsGuestNotifications }
  get supportsSyncWhenSleeping () { return this.constructor.supportsSyncWhenSleeping }
  get supportsSync () {
    // Don't inherit in case we set these seperately in the model
    return [
      this.supportsUnreadActivity,
      this.supportsUnreadCount,
      this.supportsNativeNotifications,
      this.supportsGuestNotifications
    ].find((s) => s) || false
  }
  get mergeChangesetOnActive () { return this.constructor.mergeChangesetOnActive }

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

  get zoomFactor () { return this._value_('zoomFactor', 1.0) }
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

  get unreadCount () { return 0 }
  get hasUnreadActivity () { return false }
  get trayMessages () { return [] }
  get notifications () { return [] }

  /* **************************************************************************/
  // Properties : Custom injectables
  /* **************************************************************************/

  get customCSS () { return this.__data__.customCSS }
  get hasCustomCSS () { return !!this.customCSS }
  get customJS () { return this.__data__.customJS }
  get hasCustomJS () { return !!this.customJS }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

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
