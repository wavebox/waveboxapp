import MicrosoftService from './MicrosoftService'

class MicrosoftOnenoteService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_ONENOTE }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'OneNote' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_notebook_32px.png',
      'microsoft/logo_notebook_48px.png',
      'microsoft/logo_notebook_64px.png',
      'microsoft/logo_notebook_96px.png',
      'microsoft/logo_notebook_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(129, 54, 124)' }

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
  get url () { return 'http://www.onenote.com/notebooks' }
}

export default MicrosoftOnenoteService
