import CoreACService from '../CoreACService'

class GoogleSlidesService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_SLIDES }

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
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return 'Google Slides' }
  get humanizedTypeShort () { return 'Slides' }
  get humanizedLogos () {
    return [
      'google/logo_slides_32px.png',
      'google/logo_slides_48px.png',
      'google/logo_slides_64px.png',
      'google/logo_slides_96px.png',
      'google/logo_slides_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://slides.google.com' }
}

export default GoogleSlidesService
