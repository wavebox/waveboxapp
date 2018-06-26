import MicrosoftService from './MicrosoftService'

class MicrosoftWordService extends MicrosoftService {
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

  get humanizedType () { return 'Word' }
  get humanizedLogos () {
    return [
      'microsoft/logo_docs_32px.png',
      'microsoft/logo_docs_48px.png',
      'microsoft/logo_docs_64px.png',
      'microsoft/logo_docs_96px.png',
      'microsoft/logo_docs_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get outlookUrl () { return this.url }
  get o365Url () { return this.url }
  get url () { return 'https://office.live.com/start/Word.aspx' }
}

export default MicrosoftWordService
