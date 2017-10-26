import {
  CRX_STORAGE_GET_,
  CRX_STORAGE_SET_,
  CRX_STORAGE_REMOVE_,
  CRX_STORAGE_CLEAR_
} from 'shared/crExtensionIpcEvents'
import {
  CR_STORAGE_TYPES
} from 'shared/extensionApis'
import ArgParser from 'Core/ArgParser'

import DispatchManager from 'Core/DispatchManager'
import {
  protectedCtrlEvt1,
  protectedHandleError
} from 'Runtime/ProtectedRuntimeSymbols'

const privExtensionId = Symbol('privExtensionId')
const privStorageType = Symbol('privStorageType')
const privRuntime = Symbol('privRuntime')

class StorageArea {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/storage
  * @param extensionId: the id of the extension
  * @param storageType: the type of storage
  * @param runtime: the current runtime
  */
  constructor (extensionId, storageType, runtime) {
    this[privExtensionId] = extensionId
    this[privStorageType] = storageType
    this[privRuntime] = runtime

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get QUOTA_BYTES () {
    if (this[privStorageType] === CR_STORAGE_TYPES.LOCAL) {
      return 5242880
    } else {
      return 102400
    }
  }
  get QUOTA_BYTES_PER_ITEM () { return 8192 }
  get MAX_ITEMS () { return Math.min(512, this[privRuntime][protectedCtrlEvt1]) }
  get MAX_WRITE_OPERATIONS_PER_HOUR () { return 1800 }
  get MAX_WRITE_OPERATIONS_PER_MINUTE () { return 120 }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  get (...args) {
    const [keys, defaultValues, callback] = ArgParser.match(args, [
      { pattern: ['function'], out: [null, undefined, ArgParser.MATCH_ARG_0] },
      { pattern: ['null', 'function'], out: [null, undefined, ArgParser.MATCH_ARG_1] },
      { pattern: ['array', 'function'], out: [ArgParser.MATCH_ARG_0, undefined, ArgParser.MATCH_ARG_1] },
      { pattern: ['object', 'function'], transform: ([keyset, cb]) => [Object.keys(keyset), keyset, cb] },
      { pattern: ['string', 'function'], transform: ([key, cb]) => [[key], undefined, cb] }
    ])

    DispatchManager.request(
      `${CRX_STORAGE_GET_}${this[privExtensionId]}`,
      [this[privStorageType], keys],
      (evt, err, response) => {
        if (err) {
          this[privRuntime][protectedHandleError](err)
          if (callback) {
            callback()
          }
        } else {
          if (defaultValues) {
            const responseWithDefault = (keys || []).reduce((acc, key) => {
              acc[key] = response[key] !== undefined ? response[key] : defaultValues[key]
              return acc
            }, {})
            callback(responseWithDefault)
          } else {
            callback(response)
          }
        }
      })
  }

  /* **************************************************************************/
  // Setters
  /* **************************************************************************/

  set (items, callback) {
    DispatchManager.request(
      `${CRX_STORAGE_SET_}${this[privExtensionId]}`,
      [this[privStorageType], items],
      (evt, err, response) => {
        if (err) { this[privRuntime][protectedHandleError](err) }
        if (callback) { callback() }
      })
  }

  /* **************************************************************************/
  // Removers
  /* **************************************************************************/

  remove (keyOrKeys, callback) {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
    DispatchManager.request(
      `${CRX_STORAGE_REMOVE_}${this[privExtensionId]}`,
      [this[privStorageType], keys],
      (evt, err, response) => {
        if (err) { this[privRuntime][protectedHandleError](err) }
        if (callback) { callback() }
      })
  }

  clear (callback) {
    DispatchManager.request(
      `${CRX_STORAGE_CLEAR_}${this[privExtensionId]}`,
      [this[privStorageType]],
      (evt, err, response) => {
        if (err) { this[privRuntime][protectedHandleError](err) }
        if (callback) { callback() }
      })
  }
}

export default StorageArea
