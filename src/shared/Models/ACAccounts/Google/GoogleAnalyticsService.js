import CoreACService from '../CoreACService'

class GoogleAnalyticsService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_ANALYTICS }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Analytics' }
  static get humanizedTypeShort () { return 'Analytics' }
  static get humanizedLogos () {
    return [
      'google/logo_analytics_32px.png',
      'google/logo_analytics_48px.png',
      'google/logo_analytics_64px.png',
      'google/logo_analytics_96px.png',
      'google/logo_analytics_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(241, 122, 48)' }

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
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return undefined }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://analytics.google.com' }
}

export default GoogleAnalyticsService
