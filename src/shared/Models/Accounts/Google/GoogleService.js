const CoreService = require('../CoreService')

class GoogleService extends CoreService {
  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Gets the window open mode for a given url
  * @param url: the url to open with
  * @param parsedUrl: the url object parsed by nodejs url
  * @param disposition: the open mode disposition
  * @return the window open mode
  */
  getWindowOpenModeForUrl (url, parsedUrl, disposition) {
    const superMode = super.getWindowOpenModeForUrl(url, parsedUrl, disposition)
    if (superMode !== this.constructor.WINDOW_OPEN_MODES.DEFAULT) { return superMode }

    if (parsedUrl.hostname === 'docs.google.com' || parsedUrl.hostname === 'drive.google.com') {
      return this.constructor.WINDOW_OPEN_MODES.CONTENT
    }

    if (parsedUrl.hostname.endsWith('google.com') && (parsedUrl.pathname === '/url' || parsedUrl.pathname === '/url/')) {
      if (parsedUrl.query.q) {
        if (parsedUrl.query.q.startsWith('https://drive.google.com/')) { // Embedded google drive url
          return this.constructor.WINDOW_OPEN_MODES.CONTENT
        }
      }
    }

    return this.constructor.WINDOW_OPEN_MODES.DEFAULT
  }
}

module.exports = GoogleService
