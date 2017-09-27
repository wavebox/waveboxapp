const GoogleService = require('./GoogleService')

class GoogleCommunicationService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.COMMUNICATION }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Hangouts' }
  static get humanizedTypeShort () { return 'Hangouts' }
  static get humanizedUnreadItemType () { return 'message' }
  static get humanizedLogos () {
    return [
      'images/google/logo_hangouts_32px.png',
      'images/google/logo_hangouts_48px.png',
      'images/google/logo_hangouts_64px.png',
      'images/google/logo_hangouts_128px.png'
    ]
  }

  /* **************************************************************************/
  // Class: Support
  /* **************************************************************************/

  static get supportsUnreadCount () { return true }
  static get supportsNativeNotifications () { return true }
  static get supportsTrayMessages () { return true }

  /* **************************************************************************/
  // Class: Creation
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this service
  * @return a vanilla js object representing the data for this service
  */
  static createJS () {
    return Object.assign({}, super.createJS(), {
      sleepable: false
    })
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

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get unreadCount () { return this._value_('unreadCount', 0) }
  get unreadCountUpdateTime () { return this._value_('unreadCountUpdateTime', 0) }
  get trayMessages () {
    const count = this.unreadCount
    return count === 0 ? [] : [
      {
        id: `auto_${count}`,
        text: `${count} unseen ${this.humanizedTypeShort} ${this.humanizedUnreadItemType}${count > 1 ? 's' : ''}`,
        date: this.unreadCountUpdateTime,
        data: {}
      }
    ]
  }
}

module.exports = GoogleCommunicationService
