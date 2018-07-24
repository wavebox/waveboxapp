import CoreACModel from './CoreACModel'
import SERVICE_TYPES from './ServiceTypes'
import { MAILBOX_SLEEP_WAIT } from '../../constants'
import SubclassNotImplementedError from './SubclassNotImplementedError'
import uuid from 'uuid'

const RELOAD_BEHAVIOURS = Object.freeze({
  RELOAD: 'RELOAD',
  RESET_URL: 'RESET_URL'
})

class CoreACService extends CoreACModel {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get SERVICE_TYPES () { return SERVICE_TYPES }
  static get RELOAD_BEHAVIOURS () { return RELOAD_BEHAVIOURS }
  static get type () { SubclassNotImplementedError('CoreACService.type') }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { SubclassNotImplementedError('CoreACService.humanizedType') }
  static get humanizedTypeShort () { return this.humanizedType }
  static get humanizedLogos () { SubclassNotImplementedError('CoreACService.humanizedLogos') }
  static get humanizedLogo () { return this.humanizedLogos[this.humanizedLogos.length - 1] }
  static get humanizedUnreadItemType () { return 'item' }
  static get humanizedColor () { return undefined }

  /**
  * Gets the logo at a specific size
  * @param size: the prefered size
  * @return the logo with the size or a default one
  */
  static humanizedLogoAtSize (size) {
    return this.getLogoAtSize(this.humanizedLogos, size)
  }

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
  // Class : Creating
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this service
  * @param id=autogenerate: the id of the mailbox
  * @param parentId: the id of the parent
  * @param type: the type
  * @return a vanilla js object representing the data for this service
  */
  static createJS (id = uuid.v4(), parentId, type) {
    return {
      id: id,
      changedTime: new Date().getTime(),
      parentId: parentId,
      type: type
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get parentId () { return this._value_('parentId') }
  get partitionId () {
    // It would be tidier here to use service id as the base for the partition,
    // however it's pretty tricky to teardown all the session bindings cleanly
    // in preperation for re-attaching them at a later date (e.g. sandbox then
    // un-sandbox). To be more reliable use a generated id for the partition
    // so we never re-use the same partition
    const basePartitionId = this.sandboxFromMailbox ? this._value_('sandboxedPartitionId') : this.parentId
    if (!basePartitionId) { throw new Error('Partition id invalid for service') }
    return `persist:${basePartitionId}`
  }
  get type () { return this.constructor.type }
  get sandboxFromMailbox () { return this._value_('sandboxFromMailbox', false) }

  /* **************************************************************************/
  // Properties: Sync
  /* **************************************************************************/

  get syncWatchFields () { return [] }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { SubclassNotImplementedError('CoreACService.supportsUnreadActivity') }
  get supportsUnreadCount () { SubclassNotImplementedError('CoreACService.supportsUnreadCount') }
  get supportsTrayMessages () { SubclassNotImplementedError('CoreACService.supportsTrayMessages') }
  get supportsSyncedDiffNotifications () { SubclassNotImplementedError('CoreACService.supportsSyncedDiffNotifications') }
  get supportsNativeNotifications () { SubclassNotImplementedError('CoreACService.supportsNativeNotifications') }
  get supportsGuestNotifications () { SubclassNotImplementedError('CoreACService.supportsGuestNotifications') }
  get supportsSyncWhenSleeping () { SubclassNotImplementedError('CoreACService.supportsSyncWhenSleeping') }
  get supportsSync () {
    return [
      this.supportsUnreadActivity,
      this.supportsUnreadCount,
      this.supportsNativeNotifications,
      this.supportsGuestNotifications
    ].find((s) => s) || false
  }
  get supportsWBGAPI () { SubclassNotImplementedError('CoreACService.supportsWBGAPI') }
  get supportedAuthNamespace () { SubclassNotImplementedError('CoreACService.supportedAuthNamespace') }
  get similarityNamespaceId () { return `${this.type}:${this.supportedAuthNamespace || '_'}` }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return this.constructor.humanizedType }
  get humanizedTypeShort () { return this.constructor.humanizedTypeShort }
  get humanizedLogos () { return this.constructor.humanizedLogos }
  get humanizedLogo () { return this.constructor.humanizedLogo }
  get humanizedUnreadItemType () { return this.constructor.humanizedUnreadItemType }
  get humanizedColor () { return this.constructor.humanizedColor }

  humanizedLogoAtSize (...args) { return this.constructor.humanizedLogoAtSize(...args) }

  getLogoAtSize (...args) { return this.constructor.getLogoAtSize(...args) }

  /* **************************************************************************/
  // Properties: Sleep
  /* **************************************************************************/

  get sleepable () { return this._value_('sleepable', true) }
  get sleepableTimeout () { return this._value_('sleepableTimeout', MAILBOX_SLEEP_WAIT) }
  get hasSeenSleepableWizard () { return this._value_('hasSeenSleepableWizard', false) }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get hasNavigationToolbar () { return false }
  get displayName () { return this._value_('displayName', this.serviceDisplayName) }
  get serviceDisplayName () { return this._value_('serviceDisplayName', this.humanizedType) }
  get hasExplicitServiceDisplayName () { return !!this._value_('serviceDisplayName', undefined) }
  get color () { return this._value_('color', this.humanizedColor) }

  /**
  * Gets the color with the service data
  * @param serviceData: the service data object
  * @return a color
  */
  getColorWithData (serviceData) { return this.color }

  /**
  * Gets the display name with the service data
  * @param serviceData: the service data object
  * @return a color
  */
  getDisplayNameWithData (serviceData) { return this.displayName }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { SubclassNotImplementedError('CoreACService.url') }
  get reloadBehaviour () { return RELOAD_BEHAVIOURS.RESET_URL }
  get restoreLastUrl () { return this._value_('restoreLastUrl', false) }

  /**
  * Gets the url being provided the service data if there is any customization to do
  * @param serviceData: the service data object
  * @param authData: the auth data for this service
  * @return a url
  */
  getUrlWithData (serviceData, authData) {
    if (this.restoreLastUrl && serviceData.url) {
      return serviceData.url
    } else {
      return this.url
    }
  }

  /* **************************************************************************/
  // Properties: Avatar
  /* **************************************************************************/

  get avatarId () { return this._value_('avatarId', undefined) }
  get hasAvatarId () { return !!this.avatarId }
  get serviceAvatarURL () { return this._value_('serviceAvatarURL') }
  get hasServiceAvatarURL () { return !!this.serviceAvatarURL }
  get serviceLocalAvatarId () { return this._value_('serviceLocalAvatarId') }
  get hasServiceLocalAvatarId () { return !!this.serviceLocalAvatarId }
  get serviceAvatarCharacterDisplay () { return undefined }

  /* **************************************************************************/
  // Properties: Badge & Unread
  /* **************************************************************************/

  get badgeColor () { return this._value_('badgeColor', 'rgba(238, 54, 55, 0.95)') }
  get showBadgeCount () { return this._value_('showBadgeCount', true) }
  get showBadgeActivity () { return this._value_('showBadgeActivity', true) }
  get showBadgeCountInApp () { return this._value_('showBadgeCountInApp', true) }
  get showBadgeActivityInApp () { return this._value_('showBadgeActivityInApp', true) }

  /* **************************************************************************/
  // Properties : Notifications
  /* **************************************************************************/

  get showNotifications () { return this._value_('showNotifications', true) }
  get showAvatarInNotifications () { return this._value_('showAvatarInNotifications', true) }
  get notificationsSound () { return this._value_('notificationsSound', undefined) }

  /* **************************************************************************/
  // Properties : Custom injectables
  /* **************************************************************************/

  get customCSS () { return this._value_('customCSS') }
  get hasCustomCSS () { return !!this.customCSS }
  get customJS () { return this._value_('customJS') }
  get hasCustomJS () { return !!this.customJS }

  /* **************************************************************************/
  // Properties: Adaptors
  /* **************************************************************************/

  get adaptors () { return [] }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Looks to see if the input event should be prevented
  * @param input: the input info
  * @return true if the input should be prevented, false otherwise
  */
  shouldPreventInputEvent (input) { return false }
}

export default CoreACService
