import DictionaryProvider from 'shared/SpellcheckProvider/DictionaryProvider'
import DictionaryLoader from './DictionaryLoader'

const privCache = Symbol('privCache')
const privCacheLang = Symbol('privCacheLang')

class DictionaryProviderImpl extends DictionaryProvider {
  /* ****************************************************************************/
  // Lifecucle
  /* ****************************************************************************/

  constructor () {
    super()

    this[privCacheLang] = undefined
    this[privCache] = undefined
  }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  /**
  * @override
  * Loads the dictionary synchronously
  * @param lang: the language of the dictionary
  * @return { dic, aff } or undefined
  */
  loadDictionarySync (lang) {
    if (lang === this[privCacheLang]) {
      return this[privCache]
    }

    this[privCacheLang] = lang
    this[privCache] = DictionaryLoader.loadDictionarySync(lang) || DictionaryLoader.loadFallbackDictionarySync()
    return this[privCache]
  }

  /**
  * @override
  * Unloads the current dictionary
  */
  unloadDictionarySync () {
    this[privCacheLang] = undefined
    this[privCache] = undefined
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @return the cached dictionaries
  */
  getCached () { return this[privCache] }
}

export default DictionaryProviderImpl
