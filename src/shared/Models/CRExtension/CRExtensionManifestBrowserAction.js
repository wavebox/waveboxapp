const Model = require('../Model')

class CRExtensionManifestBrowserAction extends Model {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get defaultIcon () {
    const value = this._value_('default_icon')
    if (typeof (value) === 'string') {
      return { '32': this._sanitizePathValue_(value) }
    } else if (typeof (value) === 'object') {
      return this._sanitizePathValuesInObject_(value)
    } else {
      return undefined
    }
  }
  get defaultTitle () { return this._value_('default_title') }
  get defaultPopup () { return this._value_('default_popup') }
}

module.exports = CRExtensionManifestBrowserAction
