const Model = require('../Model')
const pathTool = require('../../pathTool')

class CRExtensionManifestBackground extends Model {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get htmlPage () { return this._value_('page', undefined) }
  get hasHtmlPage () { return !!this.htmlPage }
  get scriptset () { return this._value_('scripts', []) }

  /**
  * @param scopeTo: the directory to scope to
  * @return the html page path scoped to the given arg
  */
  getHtmlPageScoped (scopeTo) {
    return this.htmlPage ? pathTool.scopeToDir(scopeTo, this.htmlPage) : undefined
  }

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
