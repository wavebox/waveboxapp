import {
  CR_RUNTIME_ENVIRONMENTS
} from 'shared/extensionApis'

const privRuntime = Symbol('privRuntime')
const privRuntimeEnvironment = Symbol('privRuntimeEnvironment')

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
    this[privRuntimeEnvironment] = runtimeEnvironment
    this[privRuntime] = runtime
    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties: Pass through
  /* **************************************************************************/

  get onMessage () { return this[privRuntime].onMessage }
  get onRequest () { return this[privRuntime].onMessage }
  get sendMessage () { return this[privRuntime].sendMessage.bind(this[privRuntime]) }
  get getURL () { return this[privRuntime].getURL.bind(this[privRuntime]) }
  get connect () { return this[privRuntime].connect.bind(this[privRuntime]) }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  get getBackgroundPage () {
    if (this[privRuntimeEnvironment] === CR_RUNTIME_ENVIRONMENTS.BACKGROUND) {
      return function () { return window }
    } else {
      return undefined
    }
  }

  /* **************************************************************************/
  // Methods
  /* **************************************************************************/

  isAllowedIncognitoAccess (callback) {
    const res = false
    setTimeout(() => callback(res))
  }

  sendRequest (...args) {
    return this[privRuntime].sendMessage(...args)
  }
}

export default Extension
