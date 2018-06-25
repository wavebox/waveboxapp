import CoreACService from '../CoreACService'
import ACContainer from '../ACContainer'
import ContainerServiceAdaptor from './ContainerServiceAdaptor'

class ContainerService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.CONTAINER }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (data) {
    super(data)

    this.__adaptors__ = undefined
    this.__container__ = require("../../UndefinedPropProxy")(new ACContainer(data.container || {}))
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get container () { return this.__container__ }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return this.container.supportsUnreadActivity }
  get supportsUnreadCount () { return this.container.supportsUnreadCount }
  get supportsTrayMessages () { return this.container.supportsTrayMessages }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return false }
  get supportsGuestNotifications () { return true }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return this.container.supportsWBGAPI }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return this.container.name }
  get humanizedLogos () { return this.container.logos }

  /* **************************************************************************/
  // Properties: Sleep
  /* **************************************************************************/

  get sleepable () { return this._value_('sleepable', this.container.sleepableDefault) }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get hasNavigationToolbar () { return this._value_('hasNavigationToolbar', this.container.hasNavigationToolbarDefault) }
  get userDisplayName () { return this._value_('displayName', this.container.name) }
  get color () { return this._value_('color', this.container.defaultColor) }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return this.container.getUrlWithSubdomain(this.urlSubdomain) }
  get reloadBehaviour () { return CoreACService.RELOAD_BEHAVIOURS[this.container.reloadBehaviour] || super.reloadBehaviour }
  get urlSubdomain () { return this._value_('urlSubdomain', '') }

  /* **************************************************************************/
  // Properties: Badge & Unread
  /* **************************************************************************/

  get badgeColor () { return this._value_('badgeColor', 'rgba(238, 54, 55, 0.95)') }
  get showBadgeCount () { return this._value_('showBadgeCount', this.container.showBadgeCountDefault) }
  get showBadgeCountInApp () { return this._value_('showBadgeCountInApp', this.container.showBadgeCountInAppDefault) }
  get showBadgeActivityInApp () { return this._value_('showBadgeActivityInApp', this.container.showBadgeActivityInAppDefault) }

  /* **************************************************************************/
  // Properties : Notifications
  /* **************************************************************************/

  get showNotifications () { return this._value_('showNotifications', this.container.showNotificationsDefault) }

  /* **************************************************************************/
  // Properties: Adaptors
  /* **************************************************************************/

  get adaptors () {
    // Lazy load this - most threads wont use it
    if (this.__adaptors__ === undefined) {
      this.__adaptors__ = this.container.adaptors.map((config) => {
        return new ContainerServiceAdaptor(config)
      })
    }
    return this.__adaptors__
  }
}

export default ContainerService


//TODO windowOpenUserConfig from classic