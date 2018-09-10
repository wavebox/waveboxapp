import MicrosoftService from './MicrosoftService'

class MicrosoftTodoService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_TODO }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Microsoft Todo' }
  static get humanizedTypeShort () { return 'Todo' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_todo_32px.png',
      'microsoft/logo_todo_48px.png',
      'microsoft/logo_todo_64px.png',
      'microsoft/logo_todo_96px.png',
      'microsoft/logo_todo_128px.png'
    ]
  }
  static get humanizedColor () { return '#507CEF' }

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

  // Microsoft todo seems to have trouble redirecting us to our language. However
  // placing an asterisk at the end of the url works around this.
  // In addition to this "todo."" only seems to work for outlook and "to-do." only
  // seems to work for O365
  get personalUrl () { return 'https://todo.microsoft.com/*' }
  get corporateUrl () { return 'https://to-do.microsoft.com/*' }
}

export default MicrosoftTodoService
