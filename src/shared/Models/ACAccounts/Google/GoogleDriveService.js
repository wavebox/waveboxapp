import CoreACService from '../CoreACService'

class GoogleDriveService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_DRIVE }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Drive' }
  static get humanizedTypeShit () { return 'Drive' }
  static get humanizedLogos () {
    return [
      'google/logo_drive_32px.png',
      'google/logo_drive_48px.png',
      'google/logo_drive_64px.png',
      'google/logo_drive_96px.png',
      'google/logo_drive_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(75, 163, 97)' }

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

  get url () { return 'https://drive.google.com' }
}

export default GoogleDriveService
