import MicrosoftService from './MicrosoftService'

class MicrosoftExcelService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_EXCEL }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Excel' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_sheets_32px.png',
      'microsoft/logo_sheets_48px.png',
      'microsoft/logo_sheets_64px.png',
      'microsoft/logo_sheets_96px.png',
      'microsoft/logo_sheets_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(52, 117, 69)' }

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

  get personalUrl () { return this.url }
  get corporateUrl () { return this.url }
  get url () { return 'https://office.live.com/start/Excel.aspx' }
}

export default MicrosoftExcelService
