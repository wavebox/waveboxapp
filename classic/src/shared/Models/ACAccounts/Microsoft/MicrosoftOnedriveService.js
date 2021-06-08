import MicrosoftService from './MicrosoftService'

class MicrosoftOnedriveService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_ONEDRIVE }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'OneDrive' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_drive_32px.png',
      'microsoft/logo_drive_48px.png',
      'microsoft/logo_drive_64px.png',
      'microsoft/logo_drive_96px.png',
      'microsoft/logo_drive_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(5, 83, 172)' }

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
  get supportedAuthNamespace () { return 'com.microsoft' }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get personalUrl () { return 'https://onedrive.live.com/' }
  get corporateUrl () { return 'https://onedrive.live.com/' }

  /**
  * @override
  */
  getUrlWithData (serviceData, authData) {
    if (authData && authData.driveUrl) {
      return authData.driveUrl
    } else {
      return super.getUrlWithData(serviceData, authData)
    }
  }
}

export default MicrosoftOnedriveService
