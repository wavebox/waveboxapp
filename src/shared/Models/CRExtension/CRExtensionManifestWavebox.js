const Model = require('../Model')
const CRExtensionMatchPatterns = require('./CRExtensionMatchPatterns')

const POPOUT_WINDOW_MODES = Object.freeze({
  CONTENT: 'CONTENT',
  CONTENT_BACKGROUND: 'CONTENT_BACKGROUND',
  POPOUT: 'POPOUT'
})

class CRExtensionManifestWavebox extends Model {
  /* **************************************************************************/
  // Class: Properties: Types
  /* **************************************************************************/

  static get POPOUT_WINDOW_MODES () { return POPOUT_WINDOW_MODES }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get version () { return this._value_('wavebox_extension_version') }
  get cwsId () {
    const explicit = this._value_('wavebox_cws_id', undefined)
    if (explicit) { return explicit }
    const inferred = this._value_('wavebox_extension_id', undefined)
    if (inferred && inferred.endsWith('-wavebox')) {
      return inferred.substr(0, inferred.length - 8)
    }
    return undefined
  }

  /* **************************************************************************/
  // Properties: Types
  /* **************************************************************************/

  get POPOUT_WINDOW_MODES () { return POPOUT_WINDOW_MODES }

  /* **************************************************************************/
  // Properties: Windows
  /* **************************************************************************/

  get popoutWindowWhitelist () { return this._value_('wavebox_popout_window_whitelist', []) }

  /**
  * Checks to see if a window should open as a popout
  * @param url: the url to open with
  * @param parsedUrl: the parsed url
  * @param disposition: the open mode disposition
  * @return {mode, match} from POPOUT_WINDOW_MODES or false
  */
  getWindowPopoutModePreference (url, parsedUrl, disposition) {
    const match = this.popoutWindowWhitelist.find((item) => {
      if (!item.pattern) { return false }

      // Check the disposition
      if (Array.isArray(item.disposition) && item.disposition.length) {
        if (item.disposition.findIndex((d) => d === disposition) === -1) { return false }
      } else if (typeof (item.disposition === 'string') && item.disposition.length) {
        if (item.disposition !== disposition) { return false }
      }

      // Check the search args
      if (Array.isArray(item.searchArgs) && item.searchArgs.length) {
        if (item.searchArgs.findIndex((a) => parsedUrl.searchParams.get(a) === null) !== -1) { return false }
      } else if (typeof (item.searchArgs) === 'string' && item.searchArgs.length) {
        if (parsedUrl.searchParams.get(item.searchArgs) === null) { return false }
      }

      // Pattern match the url
      return CRExtensionMatchPatterns.matchUrl(parsedUrl.protocol, parsedUrl.hostname, parsedUrl.pathname, item.pattern)
    })

    if (match) {
      if (typeof (match.mode) === 'string') {
        const mode = POPOUT_WINDOW_MODES[match.mode.toUpperCase()]
        if (mode) {
          return { mode: mode, match: match }
        }
      }
      return { mode: POPOUT_WINDOW_MODES.POPOUT, match: match }
    } else {
      return false
    }
  }

  /* **************************************************************************/
  // Properties: CSP
  /* **************************************************************************/

  get contentSecurityPolicy () { return this._value_('wavebox_content_security_policy') }
  get hasContentSecurityPolicy () {
    const csp = this.contentSecurityPolicy
    if (!csp) { return false }
    if (csp.useInAdditionToCSPString !== true) { return false }
    if (!Array.isArray(csp.matches) || !csp.matches.length) { return false }
    if (typeof (csp.directives) !== 'object') { return false }
    return true
  }

  /* **************************************************************************/
  // Properties: Browser Action
  /* **************************************************************************/

  get supportsBrowserAction () { return this._value_('wavebox_support_browser_action', true) }
  get browserActionOpenUrl () { return this._value_('wavebox_browser_action_open_url', undefined) }
  get hasBrowserActionOpenUrl () { return !!this.browserActionOpenUrl }
  get browserActionIconFilter () { return this._value_('wavebox_browser_action_icon_filter', '') }
  get hasBrowserActionIconFilter () { return !!this.browserActionIconFilter }

  /* **************************************************************************/
  // Properties: Cookies
  /* **************************************************************************/

  get cookieScopes () { return new Set(this._value_('wavebox_cookie_scopes', ['background'])) }

  /* **************************************************************************/
  // Properties: Web Request
  /* **************************************************************************/

  get webRequestOnBeforeRequestBlockingScript () {
    const value = this._value_('wavebox_web_request_on_before_request_blocking_script', undefined)
    if (!value) { return undefined }
    if (!Array.isArray(value.urls) || !value.urls.length) { return undefined }
    if (typeof value.js !== 'string' || !value.js.length) { return undefined }
    return value
  }
  get hasWebRequestOnBeforeRequestBlockingScript () { return !!this.webRequestOnBeforeRequestBlockingScript }
}

module.exports = CRExtensionManifestWavebox
