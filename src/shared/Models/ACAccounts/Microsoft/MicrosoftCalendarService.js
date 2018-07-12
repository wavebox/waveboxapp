import MicrosoftService from './MicrosoftService'

class MicrosoftCalendarService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_CALENDAR }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Calendar' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_calendar_32px.png',
      'microsoft/logo_calendar_48px.png',
      'microsoft/logo_calendar_64px.png',
      'microsoft/logo_calendar_96px.png',
      'microsoft/logo_calendar_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(71, 70, 169)' }

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

  get personalUrl () { return 'https://outlook.com/owa/?path=/calendar' }
  get corporateUrl () { return 'https://outlook.office365.com/owa/?path=/calendar' }
}

export default MicrosoftCalendarService
