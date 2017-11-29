const fs = require('fs')
const path = require('path')
const { PREINSTALLED_DICTIONARIES } = require('../constants')

const privUserDictionaryPath = Symbol('privUserDictionaryPath')
const privENUSDictionaryPath = Symbol('privENUSDictionaryPath')

class DictionaryLoader {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param enUSDictionaryPath: the path to the enUS dictionary
  * @param userDictionaryPath: the path to the user dictionaries
  */
  constructor (enUSDictionaryPath, userDictionaryPath) {
    this[privENUSDictionaryPath] = enUSDictionaryPath
    this[privUserDictionaryPath] = userDictionaryPath
  }

  /* **************************************************************************/
  // Loader Utils
  /* **************************************************************************/

  /**
  * Loads a custom dictionary from disk
  * @param language: the language to load
  * @return promise
  */
  _loadCustomDictionary_ (language) {
    return new Promise((resolve, reject) => {
      const tasks = [
        { path: path.join(this[privUserDictionaryPath], language + '.aff'), type: 'aff' },
        { path: path.join(this[privUserDictionaryPath], language + '.dic'), type: 'dic' }
      ].map((desc) => {
        return new Promise((resolve, reject) => {
          fs.readFile(desc.path, (err, data) => {
            err ? reject(Object.assign({ error: err }, desc)) : resolve(Object.assign({ data: data }, desc))
          })
        })
      })

      Promise.all(tasks)
        .then((loaded) => {
          const loadObj = loaded.reduce((acc, load) => {
            acc[load.type] = load.data
            return acc
          }, {})
          resolve(loadObj)
        }, (err) => {
          reject(err)
        })
    })
  }

  /**
  * Loads a custom dictionary from disk synchronously
  * @param language: the language to load
  * @return promise
  */
  _loadCustomDictionarySync_ (language) {
    const aff = fs.readFileSync(path.join(this[privUserDictionaryPath], language + '.aff'))
    const dic = fs.readFileSync(path.join(this[privUserDictionaryPath], language + '.dic'))
    return { aff: aff, dic: dic }
  }

  /**
  * Loads an inbuilt language synchronously
  * @param language: the language to load
  * @return { aff, dic }
  */
  _loadInbuiltDictionarySync_ (language) {
    if (language === 'en_US') {
      const aff = fs.readFileSync(path.join(this[privENUSDictionaryPath], 'index.aff'))
      const dic = fs.readFileSync(path.join(this[privENUSDictionaryPath], 'index.dic'))
      return { aff: aff, dic: dic }
    } else {
      throw new Error('Unknown Dictionary')
    }
  }

  /* **************************************************************************/
  // Loaders
  /* **************************************************************************/

  /**
  * Loads a dictionary synchronously
  * @param language: the language to load
  * @return the dictionary info
  */
  loadSync (language) {
    let dic

    // Try inbuild
    try {
      dic = this._loadInbuiltDictionarySync_(language)
    } catch (ex) { /* no-op */ }
    if (dic) { return dic }

    // Try custom
    try {
      dic = this._loadCustomDictionarySync_(language)
    } catch (ex) { /* no-op */ }
    if (dic) { return dic }

    throw new Error('Unknown Dictionary')
  }

  /* **************************************************************************/
  // Installed
  /* **************************************************************************/

  /**
  * Gets the installed dictionaries
  * @return a list of dictionary codes
  */
  getInstalledDictionaries () {
    let files
    try {
      files = fs.readdirSync(this[privUserDictionaryPath])
    } catch (ex) {
      files = []
    }

    const dictionaries = files.reduce((acc, filename) => {
      const ext = path.extname(filename).replace('.', '')
      const lang = path.basename(filename, '.' + ext)
      acc[lang] = acc[lang] || {}
      acc[lang][ext] = true
      return acc
    }, {})

    return Object.keys(dictionaries)
      .filter((lang) => dictionaries[lang].aff && dictionaries[lang].dic)
      .concat(PREINSTALLED_DICTIONARIES)
  }
}

module.exports = DictionaryLoader
