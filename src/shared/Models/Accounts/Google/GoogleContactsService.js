const GoogleService = require('./GoogleService')

class GoogleContactsService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.CONTACTS }
  static get humanizedType () { return 'Google Contacts' }
  static get humanizedLogos () {
    return [
      'images/google/logo_contacts_32px.png',
      'images/google/logo_contacts_48px.png',
      'images/google/logo_contacts_64px.png',
      'images/google/logo_contacts_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://contacts.google.com' }

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
    if (parsedUrl.hostname === 'mail.google.com' && parsedUrl.query.to !== undefined) { // Click email link
      return this.constructor.WINDOW_OPEN_MODES.SUPPRESS
    }

    return super.getWindowOpenModeForUrl(url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl)
  }
}

module.exports = GoogleContactsService
