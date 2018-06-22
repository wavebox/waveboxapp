import MicrosoftService from './MicrosoftService'

class MicrosoftExcelService extends MicrosoftService {
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

  get humanizedType () { return 'Excel' }
  get humanizedLogos () {
    return [
      'microsoft/logo_sheets_32px.png',
      'microsoft/logo_sheets_48px.png',
      'microsoft/logo_sheets_64px.png',
      'microsoft/logo_sheets_96px.png',
      'microsoft/logo_sheets_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get outlookUrl () { return this.url }
  get o365Url () { return this.url }
  get url () { return 'https://office.live.com/start/Excel.aspx' }
}

export default MicrosoftExcelService
