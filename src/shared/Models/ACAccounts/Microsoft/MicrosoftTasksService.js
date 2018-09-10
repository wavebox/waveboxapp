import MicrosoftService from './MicrosoftService'

class MicrosoftTasksService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_TASKS }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Tasks' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_tasks_32px.png',
      'microsoft/logo_tasks_48px.png',
      'microsoft/logo_tasks_64px.png',
      'microsoft/logo_tasks_96px.png',
      'microsoft/logo_tasks_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(31, 125, 210)' }

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

  get personalUrl () { return 'https://outlook.com/owa/?path=/tasks' }
  get corporateUrl () { return 'https://outlook.office365.com/owa/?path=/tasks' }
}

export default MicrosoftTasksService
