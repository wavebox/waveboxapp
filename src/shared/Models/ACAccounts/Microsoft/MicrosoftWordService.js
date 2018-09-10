import MicrosoftService from './MicrosoftService'

class MicrosoftWordService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_WORD }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Word' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_docs_32px.png',
      'microsoft/logo_docs_48px.png',
      'microsoft/logo_docs_64px.png',
      'microsoft/logo_docs_96px.png',
      'microsoft/logo_docs_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(40, 86, 157)' }

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
  get url () { return 'https://office.live.com/start/Word.aspx' }
}

export default MicrosoftWordService
