const Model = require('../Model')
const SERVICE_TYPES = require('./ServiceTypes')
const PROTOCOL_TYPES = require('./ProtocolTypes')
const { MAILBOX_SLEEP_WAIT } = require('../../constants')

const WINDOW_OPEN_MODES = Object.freeze({
  CONTENT: 'CONTENT',
  CONTENT_PROVSIONAL: 'CONTENT_PROVSIONAL',
  POPUP_CONTENT: 'POPUP_CONTENT',
  EXTERNAL: 'EXTERNAL',
  EXTERNAL_PROVSIONAL: 'EXTERNAL_PROVSIONAL',
  DEFAULT: 'DEFAULT',
  DEFAULT_PROVISIONAL: 'DEFAULT_PROVISIONAL',
  DOWNLOAD: 'DOWNLOAD',
  SUPPRESS: 'SUPPRESS'
})

const NAVIGATE_MODES = Object.freeze({
  DEFAULT: 'DEFAULT',
  SUPPRESS: 'SUPPRESS',
  OPEN_EXTERNAL: 'OPEN_EXTERNAL',
  OPEN_CONTENT: 'OPEN_CONTENT'
})

const RELOAD_BEHAVIOURS = Object.freeze({
  RELOAD: 'RELOAD',
  RESET_URL: 'RESET_URL'
})

class CoreService extends Model {
  /* **************************************************************************/
  // Class: Config & Types
  /* **************************************************************************/

  static get WINDOW_OPEN_MODES () { return WINDOW_OPEN_MODES }
  static get NAVIGATE_MODES () { return NAVIGATE_MODES }
  static get SERVICE_TYPES () { return SERVICE_TYPES }
  static get PROTOCOL_TYPES () { return PROTOCOL_TYPES }
  static get RELOAD_BEHAVIOURS () { return RELOAD_BEHAVIOURS }
  static get type () { return SERVICE_TYPES.UNKNOWN }

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

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return undefined }
  static get humanizedTypeShort () { return this.humanizedType }
  static get humanizedLogos () { return [] }
  static get humanizedLogo () { return this.humanizedLogos[this.humanizedLogos.length - 1] }
  static get humanizedUnreadItemType () { return 'message' }

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
  get url () { return undefined }
  get sleepable () { return this._value_('sleepable', true) }
  get sleepableTimeout () { return this._value_('sleepableTimeout', MAILBOX_SLEEP_WAIT) }
  get hasNavigationToolbar () { return false }
  get reloadBehaviour () { return RELOAD_BEHAVIOURS.RELOAD }

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
  get supportsSync () { return this.constructor.supportsSync }

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
  * Gets the window open mode for a given url
  * @param url: the url to open with
  * @param parsedUrl: the url object parsed by nodejs url
  * @param disposition: the open mode disposition
  * @param provisionalTargetUrl: the provisional target url that the user may be hovering over or have highlighted
  * @param parsedProvisionalTargetUrl: the provisional target parsed by nodejs url
  * @return the window open mode
  */
  getWindowOpenModeForUrl (url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl) {
    if (disposition === 'background-tab') {
      return WINDOW_OPEN_MODES.EXTERNAL
    } else if (disposition === 'new-window' || url === 'about:blank') {
      return WINDOW_OPEN_MODES.POPUP_CONTENT
    } else if (disposition === 'save-to-disk') {
      return WINDOW_OPEN_MODES.DOWNLOAD
    } else {
      return WINDOW_OPEN_MODES.DEFAULT
    }
  }

  /**
  * Gets the navigate mode for a url
  * @param url: the url to open with
  * @param parsedUrl: the url object parsed by nodejs url
  * @return the navigate mode
  */
  getNavigateModeForUrl (url, parsedUrl) {
    return NAVIGATE_MODES.DEFAULT
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
