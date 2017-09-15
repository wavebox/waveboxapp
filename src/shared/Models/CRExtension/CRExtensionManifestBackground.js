const Model = require('../Model')

class CRExtensionManifestBackground extends Model {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get htmlPage () {
    const value = this._value_('page', undefined)
    return value ? this._sanitizePathValue_(value) : undefined
  }
  get hasHtmlPage () { return !!this.htmlPage }
  get scriptset () { return this._value_('scripts', []) }

  /**
  * Generates a html page from the scriptset
  * @return a html page with the scripts setup
  */
  generateHtmlPageForScriptset () {
    const scriptTags = this.scriptset.map((s) => `<script type="text/javascript" src="${s}"></script>`).join('')
    return `<html><body>${scriptTags}</body></html>`
  }
}

module.exports = CRExtensionManifestBackground
