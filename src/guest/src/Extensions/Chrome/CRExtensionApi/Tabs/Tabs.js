const req = require('../../../../req')
const {
  CRX_TABS_SENDMESSAGE
} = req.shared('crExtensionIpcEvents.js')
const {
  CR_RUNTIME_ENVIRONMENTS
} = req.shared('extensionApis.js')

const CBArgs = require('../Core/CBArgs')
const DispatchManager = require('../Core/DispatchManager')

const privExtensionId = Symbol('privExtensionId')
const privRuntimeEnvironment = Symbol('privRuntimeEnvironment')

class Tabs {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/apps/tabs
  * @param extensionId: the id of the extension
  * @param runtimeEnvironment: the current runtime environment
  */
  constructor (extensionId, runtimeEnvironment) {
    this[privExtensionId] = extensionId
    this[privRuntimeEnvironment] = runtimeEnvironment
    Object.freeze(this)
  }

  /* **************************************************************************/
  // Creation
  /* **************************************************************************/

  create () {
    console.warn('chrome.tabs.create is not yet implemented', Array.from(arguments))
  }

  /* **************************************************************************/
  // Messaging
  /* **************************************************************************/

  sendMessage (...fullArgs) {
    const { callback, args } = CBArgs(fullArgs)
    let tabId
    let message
    let options
    if (args.length === 2) {
      [tabId, message] = args
    } else if (args.length === 3) {
      [tabId, message, options] = args
    } else {
      throw new Error('Invalid arguments')
    }

    if (options) {
      console.error('chrome.tabs.sendMessage does not support options')
    }

    DispatchManager.request(
      CRX_TABS_SENDMESSAGE,
      [
        this[privExtensionId],
        tabId,
        this[privRuntimeEnvironment] === CR_RUNTIME_ENVIRONMENTS.BACKGROUND,
        message
      ],
      (evt, err, response) => {
        if (!err && callback) {
          callback(response)
        }
      })
  }
}

module.exports = Tabs
