import { ipcRenderer } from 'electron'
import DictionaryProvider from 'shared/SpellcheckProvider/DictionaryProvider'

const privIpcLoadName = Symbol('privIpcLoadName')
const privPreloaded = Symbol('privPreloaded')

class DictionaryProviderImpl extends DictionaryProvider {
  /* ****************************************************************************/
  // Lifecucle
  /* ****************************************************************************/

  /**
  * @param ipcLoadName: the name of the loading ipc event
  * @param preloadedDictionary=null: if available the preloaded dictionary
  */
  constructor (ipcLoadName, preloadedDictionary = null) {
    super()

    this[privIpcLoadName] = ipcLoadName
    this[privPreloaded] = preloadedDictionary // null is not configured. It can be configured and be undefined
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
    if (!lang) { return undefined }

    if (this[privPreloaded] !== null) {
      // During the intial configure call we get the dictionary sent. This is the
      // common use case and more efficient than multiple sync calls across the ipc channel
      const preloaded = this[privPreloaded]
      this[privPreloaded] = null
      if (preloaded) {
        return { aff: Buffer.from(preloaded.aff), dic: Buffer.from(preloaded.dic) }
      } else {
        return undefined
      }
    } else {
      const data = ipcRenderer.sendSync(this[privIpcLoadName])
      if (data) {
        return { aff: Buffer.from(data.aff), dic: Buffer.from(data.dic) }
      } else {
        return undefined
      }
    }
  }

  /**
  * @override
  * Unloads the current dictionary
  */
  unloadDictionarySync () {
    this[privPreloaded] = null
  }
}

export default DictionaryProviderImpl
