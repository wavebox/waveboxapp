const GoogleService = require('./GoogleService')

class GoogleCalendarService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.CALENDAR }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Calendar' }
  static get humanizedTypeShort () { return 'Calendar' }
  static get humanizedLogos () {
    return [
      'images/google/logo_calendar_32px.png',
      'images/google/logo_calendar_48px.png',
      'images/google/logo_calendar_64px.png',
      'images/google/logo_calendar_128px.png'
    ]
  }

  /* **************************************************************************/
  // Class: Support
  /* **************************************************************************/

  static get supportsUnreadActivity () { return true }
  static get supportsGuestNotifications () { return true }
  static get mergeChangesetOnActive () {
    return { lastUnseenNotificationTime: null }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://calendar.google.com/calendar/render?new_calendar_optin=true' }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get hasUnreadActivity () { return this._value_('lastUnseenNotificationTime', null) !== null }
}

module.exports = GoogleCalendarService
