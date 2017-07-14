const GoogleService = require('./GoogleService')

class GoogleCommunicationService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.COMMUNICATION }
  static get humanizedType () { return 'Google Hangouts' }
  static get humanizedLogos () {
    return [
      'images/google/logo_hangouts_32px.png',
      'images/google/logo_hangouts_48px.png',
      'images/google/logo_hangouts_64px.png',
      'images/google/logo_hangouts_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://hangouts.google.com' }

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
    const superMode = super.getWindowOpenModeForUrl(url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl)
    if (superMode !== this.constructor.WINDOW_OPEN_MODES.DEFAULT) { return superMode }

    if (parsedUrl.hostname === 'hangouts.google.com') {
      if (parsedUrl.pathname.indexOf('/CONVERSATION/') !== -1 || parsedUrl.pathname.indexOf('/hangouts/_/meet') !== -1) {
        return this.constructor.WINDOW_OPEN_MODES.CONTENT
      }
    }

    return this.constructor.WINDOW_OPEN_MODES.DEFAULT
  }
}

module.exports = GoogleCommunicationService
