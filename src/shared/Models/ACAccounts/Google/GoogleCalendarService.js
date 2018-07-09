import CoreACService from '../CoreACService'

class GoogleCalendarService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_CALENDAR }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Calendar' }
  static get humanizedTypeShort () { return 'Calendar' }
  static get humanizedLogos () {
    return [
      'google/logo_calendar_32px.png',
      'google/logo_calendar_48px.png',
      'google/logo_calendar_64px.png',
      'google/logo_calendar_96px.png',
      'google/logo_calendar_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(69, 132, 240)' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return true }
  get supportsUnreadCount () { return false }
  get supportsTrayMessages () { return false }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return false }
  get supportsGuestNotifications () { return true }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return undefined }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://calendar.google.com/calendar/render?new_calendar_optin=true' }
}

export default GoogleCalendarService
