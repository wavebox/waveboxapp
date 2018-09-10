import mkdirp from 'mkdirp'
import path from 'path'
import fs from 'fs-extra'
import uuid from 'uuid'
import {
  DB_WRITE_DELAY_MS,
  DB_BACKUP_INTERVAL,
  DB_MAX_BACKUPS
} from 'shared/constants'
import RuntimePaths from 'Runtime/RuntimePaths'

// Setup
mkdirp.sync(RuntimePaths.DB_DIR_PATH)

const privPath = Symbol('privPath')
const privWriteHold = Symbol('privWriteHold')
const privWriteLock = Symbol('privWriteLock')
const privData = Symbol('privData')
const privLastBackup = Symbol('privLastBackup')

class StorageBucket {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (bucketName) {
    this[privPath] = path.join(RuntimePaths.DB_DIR_PATH, bucketName + '_db.json')
    this[privWriteHold] = null
    this[privWriteLock] = false
    this[privData] = undefined
    this[privLastBackup] = 0

    this._loadFromDiskSync()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get exportName () { return path.basename(this[privPath]) }

  /* ****************************************************************************/
  // Persistence
  /* ****************************************************************************/

  /**
  * Loads the database from disk. Also checks for import files
  */
  _loadFromDiskSync () {
    // Look for import data
    const importPath = `${this[privPath]}.import`
    try {
      fs.moveSync(importPath, this[privPath], { overwrite: true })
    } catch (ex) { }

    // Load the data
    let data = '{}'
    try {
      data = fs.readFileSync(this[privPath], 'utf8')
    } catch (ex) { }

    try {
      this[privData] = JSON.parse(data)
    } catch (ex) {
      this[privData] = {}
    }
  }

  /**
  * Writes the current data to disk
  */
  _writeToDisk () {
    clearTimeout(this[privWriteHold])
    this[privWriteHold] = setTimeout(() => {
      if (this[privWriteLock]) {
        // Requeue in DB_WRITE_DELAY_MS
        this._writeToDisk()
      } else {
        this[privWriteLock] = true

        const flushPath = `${this[privPath]}.${uuid.v4().replace(/-/g, '')}`
        const data = JSON.stringify(this[privData])

        Promise.resolve()
          .then(() => {
            const now = new Date().getTime()
            if (now - this[privLastBackup] < DB_BACKUP_INTERVAL) {
              return Promise.resolve()
            }

            // Run a backup first
            const backupPath = `${this[privPath]}.${now}.backup`
            return Promise.resolve()
              .then(() => fs.copy(this[privPath], backupPath))
              .then(() => fs.readdir(RuntimePaths.DB_DIR_PATH))
              .then((files) => {
                const redundantBackups = files
                  .filter((f) => f.startsWith(path.basename(this[privPath])) && f.endsWith('.backup'))
                  .map((f) => parseInt(f.replace(`${path.basename(this[privPath])}.`, '').replace('.backup', '')))
                  .sort((a, b) => b - a)
                  .slice(DB_MAX_BACKUPS)
                  .map((ts) => `${this[privPath]}.${ts}.backup`)
                return Promise.all(redundantBackups.map((path) => fs.remove(path)))
              })
              .catch(() => Promise.resolve()) // Will also end up here when this[privPath] does not exist
              .then(() => {
                this[privLastBackup] = now
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
          .then(() => {
            return Promise.resolve()
              .then(() => this._integrityCheckFile(flushPath, data))
              .catch(() => this._integrityCheckFile(flushPath, data, 100))
          })
          .then(() => fs.rename(flushPath, this[privPath]))
          .then(() => {
            this[privWriteLock] = false
          })
          .catch((_err) => {
            // Try our best to clean up on failure
            fs.remove(flushPath).catch(() => { /* no-op */ })
            this[privWriteLock] = false
          })
      }
    }, DB_WRITE_DELAY_MS)
  }

  /**
  * Runs an integrity check of the file
  * @param filePath: the path to check
  * @param expected: the expected data check
  * @param wait=0: millis to wait before running the check
  * @return resolved promise if the check is a success, throw if fail
  */
  _integrityCheckFile (filePath, expected, wait = 0) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        Promise.resolve()
          .then(() => fs.readFile(filePath, 'utf8'))
          .then((readData) => readData === expected ? Promise.resolve() : Promise.reject(new Error('StorageBucket Integrity failure')))
          .then(() => resolve())
          .catch((err) => reject(err))
      }, wait)
    })
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
    const json = this[privData][k]
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
    return Object.keys(this[privData])
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
    const stats = fs.statSync(this[privPath], 'utf8')
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
      dataSize: JSON.stringify(this[privData]).length
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
        JSON.stringify(this[privData])
        const finish = new Date().getTime()
        results.push(finish - start)
      }
      return results
    })()

    const flush = (() => {
      const results = []
      for (let i = 0; i < runs; i++) {
        const data = JSON.stringify(this[privData])
        const testPath = `${this[privPath]}.measure`
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
        const testPath = `${this[privPath]}.measure`
        const start = new Date().getTime()
        fs.writeFileSync(testPath, JSON.stringify(this[privData]))
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
  setItem (k, v) {
    this[privData][k] = '' + v
    this._writeToDisk()
    return v
  }

  /**
  * @param items: the items to set
  */
  setItems (items) {
    Object.keys(items).forEach((k) => {
      this[privData][k] = `${items[k]}`
    })
    this._writeToDisk()
  }

  /**
  * @param k: the key to set
  * @param v: the value to set
  * @return v
  */
  setJSONItem (k, v) {
    return this.setItem(k, JSON.stringify(v))
  }

  /**
  * @param items: a map of key value pairs to set
  */
  setJSONItems (items) {
    const jsonItems = Object.keys(items).reduce((acc, k) => {
      acc[k] = JSON.stringify(items[k])
      return acc
    }, {})
    return this.setItems(jsonItems)
  }

  /**
  * @param k: the key to remove
  */
  removeItem (k) {
    delete this[privData][k]
    this._writeToDisk()
  }

  /**
  * Removes all items
  */
  removeAllItems () {
    this[privData] = {}
    this._writeToDisk()
  }

  /* ****************************************************************************/
  // Import/Export
  /* ****************************************************************************/

  /**
  * Exports the data in this store
  * @return { name, data } to export
  */
  getExportData () {
    return {
      name: this.exportName,
      data: JSON.parse(JSON.stringify(this[privData]))
    }
  }

  /**
  * Gets the export manifest for this store
  * @return { name, data } to export, or throws an exception
  */
  getExportChangesetManifest () {
    const error = new Error('Not implemented/available for store')
    error.notImplemented = true
    throw error
  }

  /**
  * Gets a set of export values for this store
  * @param keys: the keys to get
  * @return { name, data } to export
  */
  getExportChangeset (keys) {
    const error = new Error('Not implemented/available for store')
    error.notImplemented = true
    throw error
  }

  /**
  * Writes the import data to disk that will be loaded next run
  * @param data: the data to write
  */
  writeImportDataSync (data) {
    fs.writeFileSync(`${this[privPath]}.import`, JSON.stringify(data))
  }
}

export default StorageBucket
