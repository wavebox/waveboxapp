const MicrosoftService = require('./MicrosoftService')

class MicrosoftCalendarService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.CALENDAR }
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

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () {
    switch (this.accessMode) {
      case this.ACCESS_MODES.OUTLOOK: return 'https://outlook.com/owa/?path=/calendar'
      case this.ACCESS_MODES.OFFICE365: return 'https://outlook.office365.com/owa/?path=/calendar'
    }
  }
}

module.exports = MicrosoftCalendarService
