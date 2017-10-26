import ArgParser from 'Core/ArgParser'

const privExtensionId = Symbol('privExtensionId')

class Management {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/management
  * @param extensionId: the id of the extension
  */
  constructor (extensionId) {
    this[privExtensionId] = extensionId
    Object.freeze(this)
  }

  /* **************************************************************************/
  // Removal
  /* **************************************************************************/

  uninstall (...fullArgs) {
    const { callback } = ArgParser.callback(fullArgs)
    console.warn('chrome.management.uninstall is not supported by Wavebox at this time')
    if (callback) {
      setTimeout(() => { callback() }, 1)
    }
  }
}

export default Management
