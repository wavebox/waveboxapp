import MicrosoftService from './MicrosoftService'

class MicrosoftPowerpointService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_POWERPOINT }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'PowerPoint' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_slides_32px.png',
      'microsoft/logo_slides_48px.png',
      'microsoft/logo_slides_64px.png',
      'microsoft/logo_slides_96px.png',
      'microsoft/logo_slides_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(185, 71, 35)' }

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
  get url () { return 'https://office.live.com/start/PowerPoint.aspx' }
}

export default MicrosoftPowerpointService
