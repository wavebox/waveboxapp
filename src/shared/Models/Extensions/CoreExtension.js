const Model = require('../Model')
const CoreExtensionManifest = require('./CoreExtensionManifest')
const uuid = require('uuid')

class CoreExtension extends Model {
  /* **************************************************************************/
  // Static: Creating
  /* **************************************************************************/

  /**
  * Creates a new extension
  * @param manifest: the raw manifest data
  * @param installId = auto: the install identifier for this
  * @param installTime = now: the install time
  * @return the json object
  */
  static createJS (manifest, installId = uuid.v4(), installTime = new Date().getTime()) {
    return {
      manifest: manifest,
      installId: installId,
      installTime: installTime
    }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param data: the data of the tab
  */
  constructor (data) {
    super(data)
    this.__manifest__ = new CoreExtensionManifest(data.manifest)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.installId }

  /* **************************************************************************/
  // Properties: Manifest
  /* **************************************************************************/

  get manifest () { return this.__manifest__ }
  get extensionId () { return this.manifest.extensionId }
  get version () { return this.manifest.version }
  get name () { return this.manifest.name }

  /* **************************************************************************/
  // Properties: Install
  /* **************************************************************************/

  get installId () { return this.__data__.installId }
  get installTime () { return this.__data__.installTime }

  /* **************************************************************************/
  // Humanized
  /* **************************************************************************/

  get humanizedIdentifier () { return `${this.name}:${this.extensionId}` }
}

module.exports = CoreExtension
