import CoreACService from '../CoreACService'

class GenericService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GENERIC }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Weblink' }
  static get humanizedLogos () {
    return [
      'generic/logo_32px.png',
      'generic/logo_48px.png',
      'generic/logo_64px.png',
      'generic/logo_96px.png',
      'generic/logo_128px.png'
    ]
  }
  static get humanizedUnreadItemType () { return 'notification' }
  static get humanizedColor () { return '#2ecc71' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return true }
  get supportsUnreadCount () { return this.supportsWBGAPI }
  get supportsTrayMessages () { return this.supportsWBGAPI }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return false }
  get supportsGuestNotifications () { return true }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return this._value_('supportsWBGAPI', false) }
  get supportedAuthNamespace () { return undefined }
  get similarityNamespaceId () { return `${this.type}:_:${this.url}` }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get hasNavigationToolbar () { return this._value_('hasNavigationToolbar', false) }
  get usePageThemeAsColor () { return this._value_('usePageThemeAsColor', false) }
  get usePageTitleAsDisplayName () { return this._value_('usePageTitleAsDisplayName', false) }

  /**
  * @overwrite
  */
  getColorWithData (serviceData) {
    if (this.usePageThemeAsColor && serviceData.documentTheme) {
      return serviceData.documentTheme
    } else {
      return this.color
    }
  }

  /**
   * @overwrite
   */
  getDisplayNameWithData (serviceData) {
    if (this.usePageTitleAsDisplayName && serviceData.documentTitle) {
      return serviceData.documentTitle
    } else {
      return this.displayName
    }
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return this._value_('url', 'about:blank') }
  get reloadBehaviour () { return CoreACService.RELOAD_BEHAVIOURS.RELOAD }
  get restoreLastUrl () { return this._value_('restoreLastUrl', true) }
}

export default GenericService
