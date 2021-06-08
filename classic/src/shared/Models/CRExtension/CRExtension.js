const path = require('path')
const Model = require('../Model')
const CRExtensionManifest = require('./CRExtensionManifest')

class CRExtension extends Model {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param srcPath: the source path of the extension
  * @param manifestData: the manifest data
  */
  constructor (srcPath, manifestData) {
    super({
      srcPath: srcPath
    })
    this.__manifest__ = new CRExtensionManifest(manifestData)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.manifest.id }
  get srcPath () { return this._value_('srcPath') }
  get manifest () { return this.__manifest__ }

  /* **************************************************************************/
  // Properties: Locales & languages
  /* **************************************************************************/

  get localesPath () { return path.join(this.srcPath, '_locales') }

  /**
  * @param language: the language to get the path for
  * @return the path to the messages for that language
  */
  getMessagesPath (language) {
    return path.join(this.localesPath, language.replace(/[./\\]/g, ''), 'messages.json')
  }
}

module.exports = CRExtension
