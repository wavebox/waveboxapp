import CoreACService from '../CoreACService'

class GoogleAlloService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_ALLO }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Allo' }
  static get humanizedTypeShort () { return 'Allo' }
  static get humanizedLogos () {
    return [
      'google/logo_allo_32px.png',
      'google/logo_allo_48px.png',
      'google/logo_allo_64px.png',
      'google/logo_allo_96px.png',
      'google/logo_allo_128px.png'
    ]
  }
  static get humanizedColor () { return '#fbbc05' }

  /* **************************************************************************/
  // Class: Creation
  /* **************************************************************************/

  /**
  * @overwrite
  */
  static createJS (...args) {
    return {
      ...super.createJS(...args),
      sleepable: false
    }
  }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return false }
  get supportsUnreadCount () { return true }
  get supportsTrayMessages () { return true }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return false }
  get supportsGuestNotifications () { return true }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return undefined }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://allo.google.com/web' }
}

export default GoogleAlloService
