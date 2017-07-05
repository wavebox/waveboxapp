const Model = require('../Model')

const TOOLWINDOW_POSITIONS = Object.freeze({
  BOTTOM: 'BOTTOM',
  SIDEBAR_O: 'SIDEBAR_O'
})

class CoreExtensionManifest extends Model {
  /* **************************************************************************/
  // Static: Types
  /* **************************************************************************/

  static get TOOLWINDOW_POSITIONS () { return TOOLWINDOW_POSITIONS }

  /* **************************************************************************/
  // Static: Validation
  /* **************************************************************************/

  /**
  * Validates a raw manifest
  * @param manifest: the manifest to validate
  * @return an array of errors and warnings { errors: warnings }
  */
  static validateManifest (manifest) {
    const errors = []
    const warnings = []

    if (manifest.manifestVersion !== 0.1) { errors.push('Unsupported manifest version') }
    if (!manifest.extensionId) { errors.push('Missing "extensionId" in manifest') }
    if (!manifest.name) { errors.push('Missing "name" in manifest') }
    if (!manifest.version) { errors.push('Missing "version" in manifest') }

    return { errors: errors, warnings: warnings }
  }

  /**
  * Gets the extension id from a raw manifest
  * @param manifest: the manifest to get the id from
  * @return the extension id from the manifest
  */
  static getExtensionId (manifest) {
    return manifest.extensionId
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get name () { return this.__data__.name }
  get manifestVersion () { return this.__data__.manifestVersion }
  get extensionId () { return this.__data__.extensionId }
  get version () { return this.__data__.version }

  /* **************************************************************************/
  // Components
  /* **************************************************************************/

  get hasHostedComponent () { return this.hasToolwindow }
  get hasContentComponent () { return this.hasContentScripts }

  /* **************************************************************************/
  // Toolwindow
  /* **************************************************************************/

  get toolwindow () { return this._value_('toolwindow', {}) }
  get hasToolwindow () { return !!this.toolwindowIndex }
  get toolwindowIndex () { return this.toolwindow.index }
  get toolwindowSize () { return this.toolwindow.size || 100 }
  get toolwindowPosition () { return TOOLWINDOW_POSITIONS[this.toolwindow.position] || TOOLWINDOW_POSITIONS.BOTTOM }

  /* **************************************************************************/
  // Content Scripts
  /* **************************************************************************/

  get contentScripts () { return this._value_('contentScripts') }
  get hasContentScripts () { return !!this.contentScripts.length }
}

module.exports = CoreExtensionManifest
