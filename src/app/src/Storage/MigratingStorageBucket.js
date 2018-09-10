import mkdirp from 'mkdirp'
import path from 'path'
import fs from 'fs-extra'
import RuntimePaths from 'Runtime/RuntimePaths'

// Setup
mkdirp.sync(RuntimePaths.DB_DIR_PATH)

const privPath = Symbol('privPath')
const privData = Symbol('privData')
const privMigrateLogPath = Symbol('privMigrateLogPath')

class MigratingStorageBucket {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (bucketName) {
    this[privPath] = path.join(RuntimePaths.DB_DIR_PATH, bucketName + '_db.json')
    this[privMigrateLogPath] = path.join(RuntimePaths.DB_DIR_PATH, bucketName + '_migrate.log')
    this[privData] = undefined

    this._loadFromDiskSync()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get exportName () { return path.basename(this[privPath]) }
  get logPath () { return this[privMigrateLogPath] }
  get hasDataToImport () { return this[privData] && Object.keys(this[privData]).length }

  /* ****************************************************************************/
  // Persistence
  /* ****************************************************************************/

  /**
  * Loads the database from disk. Also checks for import files
  */
  _loadFromDiskSync () {
    try {
      this[privData] = JSON.parse(fs.readFileSync(this[privPath], 'utf8'))
    } catch (ex) {
      this[privData] = undefined
    }
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

  /* ****************************************************************************/
  // Migration
  /* ****************************************************************************/

  /**
  * Starts the migration
  * @return true if migration happend, false otherwise
  */
  startMigration () {
    throw new Error('Not implemented')
  }

  /**
  * Finishes the migration by cleaning up
  */
  finishMigration () {
    const importPath = `${this[privPath]}.import`
    try {
      fs.moveSync(this[privPath], importPath, { overwrite: true })
    } catch (ex) {}
    this[privData] = undefined
  }

  /* ****************************************************************************/
  // Import/Export
  /* ****************************************************************************/

  /**
  * Writes the import data to disk that will be loaded next run
  * @param data: the data to write
  */
  writeImportDataSync (data) {
    fs.writeFileSync(this[privPath], JSON.stringify(data))
  }
}

export default MigratingStorageBucket
