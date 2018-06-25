import MicrosoftService from './MicrosoftService'

class MicrosoftOnedriveService extends MicrosoftService {
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

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return 'OneDrive' }
  get humanizedLogos () {
    return [
      'microsoft/logo_drive_32px.png',
      'microsoft/logo_drive_48px.png',
      'microsoft/logo_drive_64px.png',
      'microsoft/logo_drive_96px.png',
      'microsoft/logo_drive_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get outlookUrl () { return 'https://onedrive.live.com/' }
  get o365Url () { return this._value_('driveUrl', 'https://onedrive.live.com/') } //TODO I should get info from the auth
}

export default MicrosoftOnedriveService
