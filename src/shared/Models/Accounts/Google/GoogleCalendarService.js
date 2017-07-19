const GoogleService = require('./GoogleService')

class GoogleCalendarService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.CALENDAR }
  static get humanizedType () { return 'Google Calendar' }
  static get humanizedLogos () {
    return [
      'images/google/logo_calendar_32px.png',
      'images/google/logo_calendar_48px.png',
      'images/google/logo_calendar_64px.png',
      'images/google/logo_calendar_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://calendar.google.com' }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Gets the window open mode for a given url
  * @param url: the url to open with
  * @param parsedUrl: the url object parsed by nodejs url
  * @param disposition: the open mode disposition
  * @param provisionalTargetUrl: the provisional target url that the user may be hovering over or have highlighted
  * @param parsedProvisionalTargetUrl: the provisional target parsed by nodejs url
  * @return the window open mode
  */
  getWindowOpenModeForUrl (url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl) {
    if (url === 'about:blank' && provisionalTargetUrl) {
      if (parsedProvisionalTargetUrl.hostname.endsWith('.google.com') && parsedProvisionalTargetUrl.pathname.startsWith('/url') === false) {
        return this.constructor.WINDOW_OPEN_MODES.CONTENT_PROVSIONAL
      } else {
        return this.constructor.WINDOW_OPEN_MODES.EXTERNAL_PROVSIONAL
      }
    }

    const superMode = super.getWindowOpenModeForUrl(url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl)
    if (superMode !== this.constructor.WINDOW_OPEN_MODES.DEFAULT) { return superMode }

    if (parsedUrl.hostname === 'plus.google.com') { // Join meeting link from edit page
      if (parsedUrl.pathname.indexOf('/hangouts/') === 0) {
        return this.constructor.WINDOW_OPEN_MODES.CONTENT
      }
    }

    return this.constructor.WINDOW_OPEN_MODES.DEFAULT
  }
}

module.exports = GoogleCalendarService
