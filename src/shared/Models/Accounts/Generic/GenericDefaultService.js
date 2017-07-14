const CoreService = require('../CoreService')

class GenericDefaultService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.DEFAULT }
  static get humanizedType () { return 'Generic' }
  static get humanizedLogos () {
    return [
      'images/generic/logo_32px.png',
      'images/generic/logo_48px.png',
      'images/generic/logo_64px.png',
      'images/generic/logo_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return this.__data__.url || 'about:blank' }
  get sleepable () { return this._value_('sleepable', false) }
  get openWindowsExternally () { return this._value_('openWindowsExternally', false) }
  get hasNavigationToolbar () { return this._value_('hasNavigationToolbar', false) }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get hasUnreadActivity () { return !!this._value_('lastUnseenNotificationTime', undefined) }

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
    if (superMode === this.constructor.WINDOW_OPEN_MODES.DEFAULT) {
      if (this.openWindowsExternally) {
        return this.constructor.WINDOW_OPEN_MODES.EXTERNAL
      } else {
        return this.constructor.WINDOW_OPEN_MODES.CONTENT
      }
    } else {
      return superMode
    }
  }
}

module.exports = GenericDefaultService
