import { ipcRenderer } from 'electronCrx'
import ArgParser from 'Core/ArgParser'
import DispatchManager from 'Core/DispatchManager'
import Event from 'Core/Event'
import Tab from './Tab'
import { CR_RUNTIME_ENVIRONMENTS } from 'shared/extensionApis'
import {
  CRX_TABS_SENDMESSAGE,
  CRX_TABS_CREATE_,
  CRX_TABS_GET_,
  CRX_TABS_QUERY_,
  CRX_TABS_CREATED_,
  CRX_TABS_REMOVED_,
  CRX_TAB_ACTIVATED_,
  CRX_TAB_UPDATED_,
  CRX_TAB_EXECUTE_SCRIPT_
} from 'shared/crExtensionIpcEvents'

const privExtensionId = Symbol('privExtensionId')
const privRuntimeEnvironment = Symbol('privRuntimeEnvironment')
const privHasPermission = Symbol('privHasPermission')
const CREATE_SUPPORTED_OPTIONS = new Set([
  'url'
])
const QUERY_SUPPORTED_OPTIONS = new Set([
  'active',
  'windowId',
  'lastFocusedWindow',
  'url',
  'currentWindow'
])
const EXECUTE_SCRIPT_SUPPORTED_OPTIONS = new Set([
  'file'
])

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

    this.onCreated = new Event()
    this.onRemoved = new Event()
    this.onActivated = new Event()
    this.onUpdated = new Event()

    ipcRenderer.on(`${CRX_TABS_CREATED_}${this[privExtensionId]}`, (evt, tabData) => {
      this.onCreated.emit(new Tab(tabData.id, tabData))
    })
    ipcRenderer.on(`${CRX_TABS_REMOVED_}${this[privExtensionId]}`, (evt, tabData) => {
      this.onRemoved.emit(new Tab(tabData.id, tabData))
    })
    ipcRenderer.on(`${CRX_TAB_ACTIVATED_}${this[privExtensionId]}`, (evt, changeData) => {
      this.onActivated.emit(changeData)
    })
    ipcRenderer.on(`${CRX_TAB_UPDATED_}${this[privExtensionId]}`, (evt, tabId, changeData, tab) => {
      this.onUpdated.emit(tabId, changeData, tab)
    })

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Creation
  /* **************************************************************************/

  create (options, callback) {
    const unsupported = Object.keys(options).filter((k) => !CREATE_SUPPORTED_OPTIONS.has(k))
    if (unsupported.length) {
      console.warn(`chrome.tabs.create does not support the following options at this time "[${unsupported.join(', ')}]" and they will be ignored`)
    }

    DispatchManager.request(
      `${CRX_TABS_CREATE_}${this[privExtensionId]}`,
      [options],
      (evt, err, response) => {
        if (callback) {
          callback(response ? new Tab(response.id, response) : null)
        }
      })
  }

  get (tabId, callback) {
    DispatchManager.request(
      `${CRX_TABS_GET_}${this[privExtensionId]}`,
      [tabId],
      (evt, err, response) => {
        if (callback) {
          callback(response ? new Tab(response.id, response) : null)
        }
      })
  }

  query (options, callback) {
    const unsupported = Object.keys(options).filter((k) => !QUERY_SUPPORTED_OPTIONS.has(k))
    if (unsupported.length) {
      console.warn(`chrome.tabs.query does not support the following options at this time "[${unsupported.join(', ')}]" and they will be ignored`)
    }

    DispatchManager.request(
      `${CRX_TABS_QUERY_}${this[privExtensionId]}`,
      [options],
      (evt, err, response) => {
        if (callback) {
          const tabs = (response || []).map((data) => {
            return new Tab(data.id, data)
          })
          callback(tabs)
        }
      })
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

  /* **************************************************************************/
  // Execution
  /* **************************************************************************/

  executeScript (...fullArgs) {
    const { callback, args } = ArgParser.callback(fullArgs)
    const [tabId, details] = ArgParser.match(args, [
      { pattern: ['number', 'object'], out: [ArgParser.MATCH_ARG_0, ArgParser.MATCH_ARG_1] },
      { pattern: ['object'], out: [undefined, ArgParser.MATCH_ARG_0] }
    ])

    const unsupported = Object.keys(details).filter((k) => !EXECUTE_SCRIPT_SUPPORTED_OPTIONS.has(k))
    if (unsupported.length) {
      console.warn(`chrome.tabs.executeScript does not support the following options at this time "[${unsupported.join(', ')}]" and they will be ignored`)
    }

    DispatchManager.request(
      `${CRX_TAB_EXECUTE_SCRIPT_}${this[privExtensionId]}`,
      [tabId, details],
      (evt, err, response) => {
        if (callback) {
          callback(response || [])
        }
      })
  }
}

export default Tabs
