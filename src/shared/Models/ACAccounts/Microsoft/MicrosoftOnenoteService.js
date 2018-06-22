import MicrosoftService from './MicrosoftService'

class MicrosoftOnenoteService extends MicrosoftService {
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

  get humanizedType () { return 'OneNote' }
  get humanizedLogos () {
    return [
      'microsoft/logo_notebook_32px.png',
      'microsoft/logo_notebook_48px.png',
      'microsoft/logo_notebook_64px.png',
      'microsoft/logo_notebook_96px.png',
      'microsoft/logo_notebook_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get outlookUrl () { return this.url }
  get o365Url () { return this.url }
  get url () { return 'http://www.onenote.com/notebooks' }
}

export default MicrosoftOnenoteService
