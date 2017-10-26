import { CRX_TABS_SENDMESSAGE } from 'shared/crExtensionIpcEvents'
import { CR_RUNTIME_ENVIRONMENTS } from 'shared/extensionApis'
import ArgParser from 'Core/ArgParser'
import DispatchManager from 'Core/DispatchManager'
import EventUnsupported from 'Core/EventUnsupported'

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

    this.onCreated = new EventUnsupported('chrome.tabs.onCreated')
    this.onActivated = new EventUnsupported('chrome.tabs.onActivated')
    this.onUpdated = new EventUnsupported('chrome.tabs.onUpdated')

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Creation
  /* **************************************************************************/

  create (options, callback) {
    console.warn('chrome.tabs.create is not yet implemented')
    if (callback) {
      const res = []
      setTimeout(() => callback(res))
    }
  }

  query (options, callback) {
    console.warn('chrome.tabs.query is not yet implemented')
    if (callback) {
      const res = []
      setTimeout(() => callback(res))
    }
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

export default Tabs
