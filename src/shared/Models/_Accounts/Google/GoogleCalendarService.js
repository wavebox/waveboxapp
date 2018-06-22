const GoogleService = require('./GoogleService')

class GoogleCalendarService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.CALENDAR }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat([
      'lastUnseenNotificationTime'
    ])
  }

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

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://calendar.google.com/calendar/render?new_calendar_optin=true' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return true }
  get supportsGuestNotifications () { return true }
  get mergeChangesetOnActive () { return { lastUnseenNotificationTime: null } }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get hasUnreadActivity () { return this._value_('lastUnseenNotificationTime', null) !== null }
}

module.exports = GoogleCalendarService
