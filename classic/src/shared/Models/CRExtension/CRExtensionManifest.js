const path = require('path')
const Model = require('../Model')
const CRExtensionManifestBackground = require('./CRExtensionManifestBackground')
const CRExtensionManifestContentScript = require('./CRExtensionManifestContentScript')
const CRExtensionManifestBrowserAction = require('./CRExtensionManifestBrowserAction')
const CRExtensionI18n = require('./CRExtensionI18n')
const CRExtensionManifestWavebox = require('./CRExtensionManifestWavebox')

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
  // Lifecycle
  /* **************************************************************************/

  constructor (data) {
    super(data)
    this.__background__ = data.background ? new CRExtensionManifestBackground(data.background) : undefined
    this.__contentScripts__ = data.content_scripts ? data.content_scripts.map((def) => new CRExtensionManifestContentScript(def)) : []
    this.__browserAction__ = data.browser_action ? new CRExtensionManifestBrowserAction(data.browser_action) : undefined
    this.__wavebox__ = new CRExtensionManifestWavebox(data)
  }

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
  get wavebox () { return this.__wavebox__ }

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
  get hasBrowserAction () { return this.wavebox.supportsBrowserAction && !!this.browserAction }

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
}

module.exports = CRExtensionManifest
