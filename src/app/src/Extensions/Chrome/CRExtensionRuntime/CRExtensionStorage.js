import { webContents } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import pkg from 'package.json'
import AppDirectory from 'appdirectory'
import CRDispatchManager from '../CRDispatchManager'
import mkdirp from 'mkdirp'
import {
  CRX_STORAGE_GET_,
  CRX_STORAGE_SET_,
  CRX_STORAGE_REMOVE_,
  CRX_STORAGE_CLEAR_,
  CRX_STORAGE_CHANGED_
} from 'shared/crExtensionIpcEvents'
import {
  CR_STORAGE_TYPES
} from 'shared/extensionApis'

const appDirectory = new AppDirectory({
  appName: pkg.name,
  useRoaming: true
})

const DATA_PATH = path.join(appDirectory.userData(), 'crextensiondata')

class CRExtensionStorage {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.buckets = {
      [CR_STORAGE_TYPES.SYNC]: {
        path: path.join(DATA_PATH, `${this.extension.id}-sync.json`),
        cache: undefined
      },
      [CR_STORAGE_TYPES.LOCAL]: {
        path: path.join(DATA_PATH, `${this.extension.id}-local.json`),
        cache: undefined
      }
    }

    CRDispatchManager.registerHandler(`${CRX_STORAGE_GET_}${this.extension.id}`, this._handleGet)
    CRDispatchManager.registerHandler(`${CRX_STORAGE_SET_}${this.extension.id}`, this._handleSet)
    CRDispatchManager.registerHandler(`${CRX_STORAGE_REMOVE_}${this.extension.id}`, this._handleRemove)
    CRDispatchManager.registerHandler(`${CRX_STORAGE_CLEAR_}${this.extension.id}`, this._handleClear)
  }

  destroy () {
    CRDispatchManager.unregisterHandler(`${CRX_STORAGE_GET_}${this.extension.id}`, this._handleGet)
    CRDispatchManager.unregisterHandler(`${CRX_STORAGE_SET_}${this.extension.id}`, this._handleSet)
    CRDispatchManager.unregisterHandler(`${CRX_STORAGE_REMOVE_}${this.extension.id}`, this._handleRemove)
    CRDispatchManager.unregisterHandler(`${CRX_STORAGE_CLEAR_}${this.extension.id}`, this._handleClear)
  }

  /* ****************************************************************************/
  // Write & save
  /* ****************************************************************************/

  /**
  * Loads a bucket to the cache. If already in the cache just returns the cache data
  * @param storageType: the type of storage to use
  * @return promise
  */
  _loadData (storageType) {
    if (this.buckets[storageType].cache !== undefined) {
      return Promise.resolve(this.buckets[storageType].cache)
    } else {
      return Promise.resolve()
        .then(() => fs.readJson(this.buckets[storageType].path))
        .catch(() => Promise.resolve({}))
        .then((data) => {
          this.buckets[storageType].cache = data
          return data
        })
    }
  }

  /**
  * Writes data to disk and saves to cache
  * @param storageType: the type of storage to use
  * @param data: the data to write
  * @return promise
  */
  _writeData (storageType, data) {
    this.buckets[storageType].cache = data
    return Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          mkdirp(DATA_PATH, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      })
      .then(() => fs.writeJson(this.buckets[storageType].path, data))
  }

  /* ****************************************************************************/
  // Handlers
  /* ****************************************************************************/

  /**
  * Gets data from the database
  * @param evt: the event that fired
  * @param storageType: the type of storage bucket
  * @param keys: the keys to get
  * @param responseCallback: callback to execute on success
  */
  _handleGet = (evt, [storageType, keys], responseCallback) => {
    Promise.resolve()
      .then(() => this._loadData(storageType))
      .then((data) => {
        if (keys === null) {
          responseCallback(null, data)
        } else {
          const response = keys.reduce((acc, key) => {
            acc[key] = data[key]
            return acc
          }, {})
          responseCallback(null, response)
        }
      })
      .catch((err) => {
        responseCallback(err)
      })
  }

  /**
  * Sets data in the database
  * @param evt: the event that fired
  * @param storageType: the type of storage bucket
  * @param items: the items to set
  * @param responseCallback: callback to execute on success
  */
  _handleSet = (evt, [storageType, items], responseCallback) => {
    Promise.resolve()
      .then(() => this._loadData(storageType))
      .then((data) => {
        return Promise.resolve()
          .then(() => this._writeData(storageType, Object.assign({}, data, items)))
          .then(() => { return { originalData: data, items: items } })
      })
      .then(({originalData, items}) => {
        responseCallback(null)

        // Send the changeset after callback
        const changeset = Object.keys(items).reduce((acc, k) => {
          acc[k] = { oldValue: originalData[k], newValue: items[k] }
          return acc
        }, {})
        this._handleSendChangeset(changeset, storageType)
      })
      .catch((err) => {
        responseCallback(err)
      })
  }

  /**
  * Removes data from the database
  * @param evt: the event that fired
  * @param storageType: the type of storage bucket
  * @param keys: the keys to remove
  * @param responseCallback: callback to execute on success
  */
  _handleRemove = (evt, [storageType, keys], responseCallback) => {
    Promise.resolve()
      .then(() => this._loadData(storageType))
      .then((data) => {
        const nextData = keys.reduce((acc, key) => {
          delete acc[key]
          return acc
        }, Object.assign({}, data))
        return Promise.resolve()
          .then(() => this._writeData(storageType, nextData))
          .then(() => { return { originalData: data, keys: keys } })
      })
      .then(({ originalData, keys }) => {
        responseCallback(null)

        // Send the changeset after callback
        const changeset = keys.reduce((acc, k) => {
          acc[k] = { oldValue: originalData[k], newValue: undefined }
          return acc
        }, {})
        this._handleSendChangeset(changeset, storageType)
      })
      .catch((err) => {
        responseCallback(err)
      })
  }

  /**
  * Clears data from the database
  * @param evt: the event that fired
  * @param storageType: the type of storage bucket
  * @param responseCallback: callback to execute on success
  */
  _handleClear = (evt, [storageType], responseCallback) => {
    Promise.resolve()
      .then(() => this._loadData(storageType))
      .then((data) => {
        return Promise.resolve()
          .then(() => this._writeData(storageType, {}))
          .then(() => { return { originalData: data } })
      })
      .then(({ originalData }) => {
        responseCallback(null)

        // Send the changeset after callback
        const changeset = Object.keys(originalData).reduce((acc, k) => {
          acc[k] = { oldValue: originalData[k], newValue: undefined }
          return acc
        }, {})
        this._handleSendChangeset(changeset, storageType)
      })
      .catch((err) => {
        responseCallback(err)
      })
  }

  /**
  * Sends a changeset to listening extensions
  * @param changeset: the changes in the format { key: { oldValue, newValue }}
  * @param storageType: the storage type that had the changes
  */
  _handleSendChangeset (changeset, storageType) {
    webContents.getAllWebContents().forEach((targetWebcontents) => {
      targetWebcontents.send(`${CRX_STORAGE_CHANGED_}${this.extension.id}`, changeset, storageType)
    })
  }
}

export default CRExtensionStorage
