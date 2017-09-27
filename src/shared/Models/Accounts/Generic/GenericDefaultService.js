const CoreService = require('../CoreService')

class GenericDefaultService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.DEFAULT }
  get reloadBehaviour () { return this.RELOAD_BEHAVIOURS.RELOAD }

  /* **************************************************************************/
  // Class: Support
  /* **************************************************************************/

  static get supportsUnreadActivity () { return true }
  static get supportsGuestNotifications () { return true }
  static get mergeChangesetOnActive () {
    return { lastUnseenNotificationTime: null }
  }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Generic' }
  static get humanizedLogos () {
    return [
      'images/generic/logo_32px.png',
      'images/generic/logo_48px.png',
      'images/generic/logo_64px.png',
      'images/generic/logo_128px.png'
    ]
  }
  static get humanizedUnreadItemType () { return 'notification' }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return this.__data__.url || 'about:blank' }
  get sleepable () { return this._value_('sleepable', false) }
  get depricatedOpenWindowsExternally () { return this._value_('openWindowsExternally', false) }
  get hasNavigationToolbar () { return this._value_('hasNavigationToolbar', false) }
  get defaultWindowOpenMode () {
    const depricatedValue = this._value_('openWindowsExternally', undefined)
    const currentValue = this._value_('defaultWindowOpenMode', undefined)

    if (currentValue !== undefined) { return currentValue }
    if (depricatedValue !== undefined) { return this.constructor.DEFAULT_WINDOW_OPEN_MODES[depricatedValue ? 'BROWSER' : 'WAVEBOX'] }

    return super.defaultWindowOpenMode
  }

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
    return super.getWindowOpenModeForUrl(url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl)
  }
}

module.exports = GenericDefaultService
