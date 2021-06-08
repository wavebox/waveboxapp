import { ipcRenderer } from 'electronCrx'
import { CR_STORAGE_TYPES } from 'shared/extensionApis'
import {
  CRX_STORAGE_CHANGED_
} from 'shared/crExtensionIpcEvents'
import StorageArea from './StorageArea'
import Event from 'Core/Event'

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

    this.onChanged = new Event()

    ipcRenderer.on(`${CRX_STORAGE_CHANGED_}${extensionId}`, (evt, changeset, storageArea) => {
      this.onChanged.emit(changeset, storageArea.toLowerCase())
    })

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get sync () { return this[privSync] }
  get local () { return this[privLocal] }
}

export default Storage
