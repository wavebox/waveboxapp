import path from 'path'
import fs from 'fs-extra'
import RuntimePaths from 'Runtime/RuntimePaths'
import dictionaries from 'shared/SpellcheckProvider/dictionaries'
import { PREINSTALLED_DICTIONARIES } from 'shared/constants'
const BUILTIN_DICTIONARY_LANGUAGE = 'en_US'
const enUSDictionaryPath = path.join(__dirname, 'node_modules/dictionary-en-us')

class DictionaryLoader {
  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  /**
  * Loads the dictionary synchronously
  * @param lang: the language of the dictionary
  * @return { dic, aff } or undefined
  */
  static loadDictionarySync (lang) {
    try {
      if (lang === BUILTIN_DICTIONARY_LANGUAGE) {
        const aff = fs.readFileSync(path.join(enUSDictionaryPath, 'index.aff'))
        const dic = fs.readFileSync(path.join(enUSDictionaryPath, 'index.dic'))
        return { aff: aff, dic: dic }
      } else {
        const aff = fs.readFileSync(path.join(RuntimePaths.USER_DICTIONARIES_PATH, lang + '.aff'))
        const dic = fs.readFileSync(path.join(RuntimePaths.USER_DICTIONARIES_PATH, lang + '.dic'))
        return { aff: aff, dic: dic }
      }
    } catch (ex) {
      return undefined
    }
  }

  /**
  * Loads a fallback dictionary synchronously
  * @return { dic, aff }
  */
  static loadFallbackDictionarySync () {
    return this.loadDictionarySync(BUILTIN_DICTIONARY_LANGUAGE)
  }

  /* ****************************************************************************/
  // User words
  /* ****************************************************************************/

  /**
  * Loads the user words from disk synchronously
  * @return a list of user words
  */
  static loadUserWordsSync () {
    let data
    try {
      data = fs.readFileSync(RuntimePaths.USER_DICTIONARY_WORDS_PATH, 'utf8')
    } catch (ex) {
      data = ''
    }

    return data.split('\n')
      .map((w) => w.trim())
      .filter((w) => !!w)
  }

  /**
  * Writes the user words sync
  * @param words: the words to write
  * @param suppressErrors=true: true to suppress errors
  */
  static writeUserWordsSync (words, suppressErrors = true) {
    const data = words.join('\n')
    try {
      fs.writeFileSync(RuntimePaths.USER_DICTIONARY_WORDS_PATH, data)
    } catch (ex) {
      if (!suppressErrors) { throw ex }
    }
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * Gets the humanized language name
  * @param language: the language to get the humanized version of
  * @return a humanized version
  */
  static getHumanizedLanguageName (language) {
    return (dictionaries[language] || {}).name || language
  }

  /**
  * Gets a list of installed dictionaries
  * @return a list of installed dictionary info
  */
  static getInstalledDictionaries () {
    let files
    try {
      files = fs.readdirSync(RuntimePaths.USER_DICTIONARIES_PATH)
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

export default DictionaryLoader
