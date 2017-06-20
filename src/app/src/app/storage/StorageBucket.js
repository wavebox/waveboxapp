const { EventEmitter } = require('events')
const { ipcMain } = require('electron')
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs-extra')
const uuid = require('uuid')
const {
  DB_WRITE_DELAY_MS,
  DB_BACKUP_INTERVAL,
  DB_MAX_BACKUPS
} = require('../../shared/constants')
const { DB_DIR_PATH } = require('../MProcManagers/PathManager')

// Setup
mkdirp.sync(DB_DIR_PATH)

class StorageBucket extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (bucketName) {
    super()
    this.__path__ = path.join(DB_DIR_PATH, bucketName + '_db.json')
    this.__writeHold__ = null
    this.__writeLock__ = false
    this.__data__ = undefined
    this.__lastBackup__ = 0
    this.__ipcReplyChannel__ = `storageBucket:${bucketName}:reply`

    this._loadFromDiskSync()

    ipcMain.on(`storageBucket:${bucketName}:setItem`, this._handleIPCSetItem.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:removeItem`, this._handleIPCRemoveItem.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:getItem`, this._handleIPCGetItem.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:allKeys`, this._handleIPCAllKeys.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:allItems`, this._handleIPCAllItems.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:getStats`, this._handleIPCGetStats.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:measurePerformance`, this._handleIPCMeasurePerformance.bind(this))
  }

  checkAwake () { return true }

  /* ****************************************************************************/
  // Persistence
  /* ****************************************************************************/

  /**
  * Loads the database from disk. Also checks for import files
  */
  _loadFromDiskSync () {
    // Look for import data
    const importPath = `${this.__path__}.import`
    try {
      fs.moveSync(importPath, this.__path__, { overwrite: true })
    } catch (ex) { }

    // Load the data
    let data = '{}'
    try {
      data = fs.readFileSync(this.__path__, 'utf8')
    } catch (ex) { }

    try {
      this.__data__ = JSON.parse(data)
    } catch (ex) {
      this.__data__ = {}
    }
  }

  /**
  * Writes the current data to disk
  */
  _writeToDisk () {
    clearTimeout(this.__writeHold__)
    this.__writeHold__ = setTimeout(() => {
      if (this.__writeLock__) {
        // Requeue in DB_WRITE_DELAY_MS
        this._writeToDisk()
      } else {
        this.__writeLock__ = true

        const flushPath = `${this.__path__}.${uuid.v4().replace(/-/g, '')}`
        const data = JSON.stringify(this.__data__)

        Promise.resolve()
          .then(() => {
            const now = new Date().getTime()
            if (now - this.__lastBackup__ < DB_BACKUP_INTERVAL) {
              return Promise.resolve()
            }

            // Run a backup first
            const backupPath = `${this.__path__}.${now}.backup`
            return Promise.resolve()
              .then(() => fs.copy(this.__path__, backupPath))
              .then(() => fs.readdir(DB_DIR_PATH))
              .then((files) => {
                const redundantBackups = files
                  .filter((f) => f.startsWith(path.basename(this.__path__)) && f.endsWith('.backup'))
                  .map((f) => parseInt(f.replace(`${path.basename(this.__path__)}.`, '').replace('.backup', '')))
                  .sort((a, b) => b - a)
                  .slice(DB_MAX_BACKUPS)
                  .map((ts) => `${this.__path__}.${ts}.backup`)
                return Promise.all(redundantBackups.map((path) => fs.remove(path)))
              })
              .catch(() => Promise.resolve()) // Will also end up here when this.__path__ does not exist
              .then(() => {
                this.__lastBackup__ = now
                return Promise.resolve()
              })
          })
          .then(() => fs.open(flushPath, 'w'))
          .then((ref) => {
            return Promise.resolve()
              .then(() => fs.write(ref, data, 0, data))
              .then(() => fs.fsync(ref))
              .then(() => fs.close(ref))
          })
          .then(() => fs.readFile(flushPath, 'utf8'))
          .then((readData) => readData === data ? Promise.resolve() : Promise.reject(new Error('Integrity failure')))
          .then(() => fs.rename(flushPath, this.__path__))
          .then(() => {
            this.__writeLock__ = false
          }, (e) => {
            this.__writeLock__ = false
          })
      }
    }, DB_WRITE_DELAY_MS)
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return the string item or d
  */
  getItem (k, d) {
    const json = this.__data__[k]
    return json || d
  }

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return the string item or d
  */
  getJSONItem (k, d) {
    const item = this.getItem(k)
    try {
      return item ? JSON.parse(item) : d
    } catch (ex) {
      return {}
    }
  }

  /**
  * @return a list of all keys
  */
  allKeys () {
    return Object.keys(this.__data__)
  }

  /**
  * @return all the items in an obj
  */
  allItems () {
    return this.allKeys().reduce((acc, key) => {
      acc[key] = this.getItem(key)
      return acc
    }, {})
  }

  /**
  * @return all the items in an obj json parsed
  */
  allJSONItems () {
    return this.allKeys().reduce((acc, key) => {
      acc[key] = this.getJSONItem(key)
      return acc
    }, {})
  }

  /**
  * @return the size of the file
  */
  getFileSize () {
    const stats = fs.statSync(this.__path__, 'utf8')
    return stats.size
  }

  /**
  * @return the length of each key
  */
  getKeyLengths () {
    return this.allKeys().reduce((acc, key) => {
      const item = this.getItem(key)
      if (item) {
        acc[key] = item.length
      }
      return acc
    }, {})
  }

  /**
  * @return a set of stats for this bucket
  */
  getStats () {
    return {
      filesize: this.getFileSize(),
      keyLengths: this.getKeyLengths(),
      dataSize: JSON.stringify(this.__data__).length
    }
  }

  /**
  * @param runs=20: the amount of times to run each test
  * @return some performance measures for this bucket
  */
  measurePerformance (runs = 20) {
    const serialize = (() => {
      const results = []
      for (let i = 0; i < runs; i++) {
        const start = new Date().getTime()
        JSON.stringify(this.__data__)
        const finish = new Date().getTime()
        results.push(finish - start)
      }
      return results
    })()

    const flush = (() => {
      const results = []
      for (let i = 0; i < runs; i++) {
        const data = JSON.stringify(this.__data__)
        const testPath = `${this.__path__}.measure`
        const start = new Date().getTime()
        fs.writeFileSync(testPath, data)
        const finish = new Date().getTime()
        results.push(finish - start)
      }
      return results
    })()

    const both = (() => {
      const results = []
      for (let i = 0; i < runs; i++) {
        const testPath = `${this.__path__}.measure`
        const start = new Date().getTime()
        fs.writeFileSync(testPath, JSON.stringify(this.__data__))
        const finish = new Date().getTime()
        results.push(finish - start)
      }
      return results
    })()

    return {
      serialize: serialize,
      flush: flush,
      both: both
    }
  }

  /* ****************************************************************************/
  // Modifiers
  /* ****************************************************************************/

  /**
  * @param k: the key to set
  * @param v: the value to set
  * @return v
  */
  _setItem (k, v) {
    this.__data__[k] = '' + v
    this._writeToDisk()
    this.emit('changed', { type: 'setItem', key: k })
    this.emit('changed:' + k, { })
    return v
  }

  /**
  * @param k: the key to remove
  */
  _removeItem (k) {
    delete this.__data__[k]
    this._writeToDisk()
    this.emit('changed', { type: 'removeItem', key: k })
    this.emit('changed:' + k, { })
  }

  /* ****************************************************************************/
  // IPC Access
  /* ****************************************************************************/

  /**
  * Responds to an ipc message
  * @param evt: the original event that fired
  * @param response: teh response to send
  * @param sendSync: set to true to respond synchronously
  */
  _sendIPCResponse (evt, response, sendSync = false) {
    if (sendSync) {
      evt.returnValue = response
    } else {
      evt.sender.send(this.__ipcReplyChannel__, response)
    }
  }

  /**
  * Sets an item over IPC
  * @param evt: the fired event
  * @param body: request body
  */
  _handleIPCSetItem (evt, body) {
    this._setItem(body.key, body.value)
    this._sendIPCResponse(evt, { id: body.id, response: null }, body.sync)
  }

  /**
  * Removes an item over IPC
  * @param evt: the fired event
  * @param body: request body
  */
  _handleIPCRemoveItem (evt, body) {
    this._removeItem(body.key)
    this._sendIPCResponse(evt, { id: body.id, response: null }, body.sync)
  }

  /**
  * Gets an item over IPC
  * @param evt: the fired event
  * @param body: request body
  */
  _handleIPCGetItem (evt, body) {
    this._sendIPCResponse(evt, {
      id: body.id,
      response: this.getItem(body.key)
    }, body.sync)
  }

  /**
  * Gets the keys over IPC
  * @param body: request body
  */
  _handleIPCAllKeys (evt, body) {
    this._sendIPCResponse(evt, {
      id: body.id,
      response: this.allKeys()
    }, body.sync)
  }

  /**
  * Gets all the items over IPC
  * @param body: request body
  */
  _handleIPCAllItems (evt, body) {
    this._sendIPCResponse(evt, {
      id: body.id,
      response: this.allItems()
    }, body.sync)
  }

  /**
  * Gets stats for the database
  * @param body: request body
  */
  _handleIPCGetStats (evt, body) {
    this._sendIPCResponse(evt, {
      id: body.id,
      response: this.getStats()
    }, body.sync)
  }

  /**
  * Measures the buckets performance
  * @param body: request body
  */
  _handleIPCMeasurePerformance (evt, body) {
    this._sendIPCResponse(evt, {
      id: body.id,
      response: this.measurePerformance(body.runs)
    }, body.sync)
  }
}

module.exports = StorageBucket
