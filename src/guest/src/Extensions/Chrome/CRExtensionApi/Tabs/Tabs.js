const req = require('../../../../req')
const {
  CRX_TABS_SENDMESSAGE
} = req.shared('crExtensionIpcEvents.js')
const {
  CR_RUNTIME_ENVIRONMENTS
} = req.shared('extensionApis.js')

const ArgParser = require('../Core/ArgParser')
const DispatchManager = require('../Core/DispatchManager')

const privExtensionId = Symbol('privExtensionId')
const privRuntimeEnvironment = Symbol('privRuntimeEnvironment')
const privHasPermission = Symbol('privHasPermission')

class Tabs {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/apps/tabs
  * @param extensionId: the id of the extension
  * @param runtimeEnvironment: the current runtime environment
  * @param hasPermission: true if the extension has the tabs permission
  */
  constructor (extensionId, runtimeEnvironment, hasPermission) {
    this[privExtensionId] = extensionId
    this[privRuntimeEnvironment] = runtimeEnvironment
    this[privHasPermission] = hasPermission

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
    const { callback, args } = ArgParser.callback(fullArgs)
    const [tabId, message, options] = ArgParser.match(args, [
      { pattern: ['number', 'any', 'object'], out: [ArgParser.MATCH_ARG_0, ArgParser.MATCH_ARG_1, ArgParser.MATCH_ARG_2] },
      { pattern: ['number', 'any'], out: [ArgParser.MATCH_ARG_0, ArgParser.MATCH_ARG_1, undefined] }
    ])

    if (options) {
      console.warn('chrome.tabs.sendMessage does not yet support options', options)
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
