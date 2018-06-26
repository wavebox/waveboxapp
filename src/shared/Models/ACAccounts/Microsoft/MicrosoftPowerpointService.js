import MicrosoftService from './MicrosoftService'

class MicrosoftPowerpointService extends MicrosoftService {
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

  get humanizedType () { return 'PowerPoint' }
  get humanizedLogos () {
    return [
      'microsoft/logo_slides_32px.png',
      'microsoft/logo_slides_48px.png',
      'microsoft/logo_slides_64px.png',
      'microsoft/logo_slides_96px.png',
      'microsoft/logo_slides_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get outlookUrl () { return this.url }
  get o365Url () { return this.url }
  get url () { return 'https://office.live.com/start/PowerPoint.aspx' }
}

export default MicrosoftPowerpointService
