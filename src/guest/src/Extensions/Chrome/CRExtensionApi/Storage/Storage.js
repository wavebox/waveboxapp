const req = require('../../../../req')
const {
  CR_RUNTIME_ENVIRONMENTS,
  CR_STORAGE_TYPES
} = req.shared('extensionApis')
const StorageArea = require('./StorageArea')

const privSync = Symbol('privSync')
const privLocal = Symbol('privLocal')
const privRuntimeEnvironment = Symbol('privRuntimeEnvironment')

class Storage {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/storage
  * @param extensionId: the id of the extension
  * @param runtimeEnvironment: the runtime environment
  * @param runtime: the current runtime
  */
  constructor (extensionId, runtimeEnvironment, runtime) {
    this[privSync] = new StorageArea(extensionId, CR_STORAGE_TYPES.SYNC, runtime)
    this[privLocal] = new StorageArea(extensionId, CR_STORAGE_TYPES.LOCAL, runtime)
    this[privRuntimeEnvironment] = runtimeEnvironment

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get sync () {
    if (this[privRuntimeEnvironment] === CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT) {
      throw new Error('chrome.storage.sync is not available in content scripts')
    }
    return this[privSync]
  }

  get local () {
    if (this[privRuntimeEnvironment] === CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT) {
      throw new Error('chrome.storage.sync is not available in content scripts')
    }
    return this[privLocal]
  }
}

module.exports = Storage
