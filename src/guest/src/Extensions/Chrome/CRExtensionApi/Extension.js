const privRuntime = Symbol('privRuntime')

class Extension {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/extension
  * @param extensionId: the id of the extension
  * @param runtimeEnvironment: the current runtime environment
  * @param runtime: the runtime object we proxy some requests through for
  */
  constructor (extensionId, runtimeEnvironment, runtime) {
    this[privRuntime] = runtime
    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties: Pass through
  /* **************************************************************************/

  get onMessage () { return this[privRuntime].onMessage }
  get sendMessage () { return this[privRuntime].sendMessage.bind(this[privRuntime]) }
  get getURL () { return this[privRuntime].getURL.bind(this[privRuntime]) }
}

module.exports = Extension
