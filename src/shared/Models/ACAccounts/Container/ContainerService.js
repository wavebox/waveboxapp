import CoreACService from '../CoreACService'
import { ACContainer, ACContainerSAPI } from '../../ACContainer'
import ContainerServiceAdaptor from './ContainerServiceAdaptor'
import CoreACServiceCommand from '../CoreACServiceCommand'

class ContainerService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.CONTAINER }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Container' }
  static get humanizedLogos () { return [] }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (data) {
    super(data)

    this.__adaptors__ = undefined
    this.__commands__ = undefined
    this.__container__ = new ACContainer(data.container || {})
    this.__containerSAPI__ = new ACContainerSAPI(data.containerSAPI || {})
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get iengineAlias () { return `${this.type}:${this.containerId}` }
  get container () { return this.__container__ }
  get containerSAPI () { return this.__containerSAPI__ }
  get containerId () { return this._value_('containerId', undefined) }
  get hasSAPIConfig () { return this.containerSAPI.hasConfig }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return this.containerSAPI.getSupportsUnreadActivity(this.container.supportsUnreadActivity) }
  get supportsUnreadCount () { return this.containerSAPI.getSupportsUnreadCount(this.container.supportsUnreadCount) }
  get supportsTrayMessages () { return this.containerSAPI.getSupportsTrayMessages(this.container.supportsTrayMessages) }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return false }
  get supportsGuestNotifications () { return this.containerSAPI.getSupportsGuestNotifications(this.container.supportsGuestNotifications) }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return this.containerSAPI.getSupportsWBGAPI(this.container.supportsWBGAPI) }
  get supportedAuthNamespace () { return undefined }
  get similarityNamespaceId () { return `${this.type}:${this.containerId}` }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return this.container.name }
  get humanizedTypeShort () { return this.container.name }
  get humanizedLogos () { return this.container.logos }
  get humanizedLogo () { return this.humanizedLogos[this.humanizedLogos.length - 1] }
  get humanizedColor () { return this.container.defaultColor }

  humanizedLogoAtSize (size) { return this.getLogoAtSize(this.humanizedLogos, size) }

  /* **************************************************************************/
  // Properties: Sleep
  /* **************************************************************************/

  get sleepable () { return this._value_('sleepable', this.container.sleepableDefault) }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get hasNavigationToolbar () { return this._value_('hasNavigationToolbar', this.container.hasNavigationToolbarDefault) }
  get userDisplayName () { return this._value_('displayName', this.container.name) }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return this.container.getUrlWithConfig(this.urlOverwrite, this.urlSubdomain) }
  get reloadBehaviour () { return CoreACService.RELOAD_BEHAVIOURS[this.container.reloadBehaviour] || super.reloadBehaviour }
  get urlSubdomain () { return this._value_('urlSubdomain', '') }
  get urlOverwrite () { return this._value_('urlOverwrite', '') }
  get useAsyncAlerts () { return this.containerSAPI.getUseAsyncAlerts(this.container.useAsyncAlerts) }
  get html5NotificationsGenerateUnreadActivity () { return this.containerSAPI.getHtml5NotificationsGenerateUnreadActivity(this.container.html5NotificationsGenerateUnreadActivity) }

  /* **************************************************************************/
  // Properties: Badge & Unread
  /* **************************************************************************/

  get badgeColor () { return this._value_('badgeColor', 'rgba(238, 54, 55, 0.95)') }
  get showBadgeCount () { return this._value_('showBadgeCount', this.container.showBadgeCountDefault) }
  get showBadgeCountInApp () { return this._value_('showBadgeCountInApp', this.container.showBadgeCountInAppDefault) }
  get showBadgeActivityInApp () { return this._value_('showBadgeActivityInApp', this.container.showBadgeActivityInAppDefault) }
  get documentTitleHasUnread () { return this.containerSAPI.getDocumentTitleHasUnread(this.container.documentTitleHasUnread) }
  get documentTitleUnreadBlinks () { return this.containerSAPI.getDocumentTitleUnreadBlinks(this.container.documentTitleUnreadBlinks) }
  get faviconUnreadActivityRegexp () { return this.containerSAPI.getFaviconUnreadActivityRegexp(this.container.faviconUnreadActivityRegexp) }

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
      const raw = this.containerSAPI.getAdaptors(this.container.adaptors)
      this.__adaptors__ = raw.map((config) => {
        return new ContainerServiceAdaptor(config)
      })
    }
    return this.__adaptors__
  }

  /* **************************************************************************/
  // Properties: Commands
  /* **************************************************************************/

  get commands () {
    if (this.__commands__ === undefined) {
      const raw = this.containerSAPI.getCommands(this.container.commands)
      this.__commands__ = raw.map((command) => {
        return new CoreACServiceCommand(command)
      })
    }
    return this.__commands__
  }
}

export default ContainerService
