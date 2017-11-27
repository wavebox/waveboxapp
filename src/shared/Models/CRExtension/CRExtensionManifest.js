const path = require('path')
const Model = require('../Model')
const CRExtensionManifestBackground = require('./CRExtensionManifestBackground')
const CRExtensionManifestContentScript = require('./CRExtensionManifestContentScript')
const CRExtensionManifestBrowserAction = require('./CRExtensionManifestBrowserAction')
const CRExtensionI18n = require('./CRExtensionI18n')
const CRExtensionMatchPatterns = require('./CRExtensionMatchPatterns')

const POPOUT_WINDOW_MODES = Object.freeze({
  CONTENT: 'CONTENT',
  POPOUT: 'POPOUT'
})

class CRExtensionManifest extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * @param manifestData: the manifest data to get the id from
  * @return the id or undefined
  */
  static getIdFromManifestData (manifestData) {
    return manifestData.wavebox_extension_id
  }

  /**
  * @param manifestData: the manifest data to check
  * @return true if the manfiest data looks valid
  */
  static isValidManifestData (manifestData) {
    if (!this.getIdFromManifestData(manifestData)) { return false }
    return true
  }

  /* **************************************************************************/
  // Class: Properties: Types
  /* **************************************************************************/

  static get POPOUT_WINDOW_MODES () { return POPOUT_WINDOW_MODES }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (data) {
    super(data)
    this.__background__ = data.background ? new CRExtensionManifestBackground(data.background) : undefined
    this.__contentScripts__ = data.content_scripts ? data.content_scripts.map((def) => new CRExtensionManifestContentScript(def)) : []
    this.__browserAction__ = data.browser_action ? new CRExtensionManifestBrowserAction(data.browser_action) : undefined
  }

  /* **************************************************************************/
  // Properties: Types
  /* **************************************************************************/

  get POPOUT_WINDOW_MODES () { return POPOUT_WINDOW_MODES }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this._value_('wavebox_extension_id') }
  get name () { return this._value_('name') }
  get description () { return this._value_('description') }
  get defaultLocale () { return this._value_('default_locale', 'en') }
  get homepageUrl () { return this._value_('homepage_url') }
  get hasHomepageUrl () { return !!this.homepageUrl }
  get icons () { return this._value_('icons', {}) }
  get manifestVersion () { return this._value_('manifest_version', 1) }
  get version () { return this._value_('version') }
  get waveboxVersion () { return this._value_('wavebox_extension_version') }

  /**
  * Return the icons relative to the given root path
  * @param root: the root path
  * @return all icons resolved to the given root path
  */
  getIconsRelativeTo (root) {
    const icons = this.icons
    return Object.keys(icons).reduce((acc, size) => {
      acc[size] = path.join(root, icons[size])
      return acc
    }, {})
  }

  /* **************************************************************************/
  // Properties: Permissions
  /* **************************************************************************/

  get permissions () { return new Set(this._value_('permissions', [])) }
  get contentSecurityPolicy () {
    return this._value_('content_security_policy', this.manifestVersion === 2 ? `script-src 'self'; object-src 'self'` : undefined)
  }

  /* **************************************************************************/
  // Properties: Background
  /* **************************************************************************/

  get background () { return this.__background__ }
  get hasBackground () { return !!this.background }

  /* **************************************************************************/
  // Properties: Content scripts
  /* **************************************************************************/

  get contentScripts () { return this.__contentScripts__ }
  get hasContentScripts () { return this.__contentScripts__.length !== 0 }

  /* **************************************************************************/
  // Properties: Browser action
  /* **************************************************************************/

  get browserAction () { return this.__browserAction__ }
  get hasBrowserAction () { return this.waveboxSupportsBrowserAction && !!this.browserAction }

  /* **************************************************************************/
  // Properties: Options
  /* **************************************************************************/

  get optionsPage () {
    const optionsPage = this._value_('options_page')
    const optionsUI = this._value_('options_ui', {})
    if (optionsPage) {
      return optionsPage
    } else if (optionsUI.open_in_tab && optionsUI.page) {
      return optionsUI.page
    } else {
      return undefined
    }
  }
  get hasOptionsPage () { return !!this.optionsPage }

  /* **************************************************************************/
  // Translation
  /* **************************************************************************/

  /**
  * Generates a translated version of this model
  * @param messages: the messages to use to run the translation
  * @return a new CRExtensionManifest
  */
  generateTranslatedClone (messages) {
    const data = CRExtensionI18n.translatedManifest(messages, this.__data__)
    return new CRExtensionManifest(data)
  }

  /* **************************************************************************/
  // Wavebox
  /* **************************************************************************/

  get popoutWindowWhitelist () { return this._value_('wavebox_popout_window_whitelist', []) }
  get popoutWindowPostmessageCapture () { return this._value_('wavebox_popout_postmessage_capture', []) }

  /**
  * Checks to see if a window should open as a popout
  * @param url: the url to open with
  * @param parsedUrl: the parsed url
  * @param disposition: the open mode disposition
  * @return the mode the window should use from POPOUT_WINDOW_MODES or false if nothing is matches
  */
  shouldOpenWindowAsPopout (url, parsedUrl, disposition) {
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
        if (item.searchArgs.findIndex((a) => parsedUrl.query[a] === undefined) !== -1) { return false }
      } else if (typeof (item.searchArgs) === 'string' && item.searchArgs.length) {
        if (parsedUrl.query[item.searchArgs] === undefined) { return false }
      }

      // Pattern match the url
      return CRExtensionMatchPatterns.matchUrl(parsedUrl.protocol, parsedUrl.hostname, parsedUrl.pathname, item.pattern)
    })

    if (match) {
      if (typeof (match.mode) === 'string') {
        const mode = POPOUT_WINDOW_MODES[match.mode.toUpperCase()]
        if (mode) { return mode }
      }
      return POPOUT_WINDOW_MODES.POPOUT
    } else {
      return false
    }
  }

  get hasWaveboxContentSecurityPolicy () {
    const csp = this.waveboxContentSecurityPolicy
    return csp && Array.isArray(csp.matches) && csp.matches.length && typeof (csp.directives) === 'object'
  }
  get waveboxContentSecurityPolicy () {
    return this._value_('wavebox_content_security_policy')
  }

  get waveboxSupportsBrowserAction () { return this._value_('wavebox_support_browser_action', true) }

  get cwsId () {
    const explicit = this._value_('wavebox_cws_id', undefined)
    if (explicit) { return explicit }
    const inferred = this._value_('wavebox_extension_id', undefined)
    if (inferred && inferred.endsWith('-wavebox')) {
      return inferred.substr(0, inferred.length - 8)
    }
    return undefined
  }

  get waveboxCookieScopes () { return new Set(this._value_('wavebox_cookie_scopes', ['background'])) }
}

module.exports = CRExtensionManifest
