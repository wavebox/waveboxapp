import { webFrame, ipcRenderer } from 'electron'
import elconsole from '../elconsole'
import SpellcheckProvider from 'shared/SpellcheckProvider/SpellcheckProvider'
import DictionaryLoader from 'shared/SpellcheckProvider/DictionaryLoader'
import { WB_SPELLCHECKER_CONNECT, WB_SPELLCHECKER_CONFIGURE } from 'shared/ipcEvents'
import RuntimePaths from 'Runtime/RuntimePaths'
import Resolver from 'Runtime/Resolver'

let Nodehun
try {
  Nodehun = require('nodehun')
} catch (ex) {
  elconsole.error('Failed to load spellchecker', ex)
}

const enUSDictionaryPath = Resolver.appNodeModules('dictionary-en-us')
const privDictionaryLoader = Symbol('privDictionaryLoader')
const privPrimary = Symbol('privPrimary')
const privSecondary = Symbol('privSecondary')

class Spellchecker {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privDictionaryLoader] = new DictionaryLoader(enUSDictionaryPath, RuntimePaths.USER_DICTIONARIES_PATH)
    this[privPrimary] = new SpellcheckProvider(this[privDictionaryLoader], Nodehun)
    this[privSecondary] = new SpellcheckProvider(this[privDictionaryLoader], Nodehun)

    if (Nodehun) {
      ipcRenderer.on(WB_SPELLCHECKER_CONFIGURE, this._handleRuntimeConfigure)
      setTimeout(() => { // Requeue to ensure the bridge is initialized
        ipcRenderer.send(WB_SPELLCHECKER_CONNECT, {})
      })
    }
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Configures the runtime dictionaries
  * @param evt: the event that fired
  * @param data: the configuration
  */
  _handleRuntimeConfigure = (evt, data) => {
    if (!Nodehun) { return }
    this[privPrimary].language = data.language
    this[privPrimary].addWords(data.userWords || [])
    this[privSecondary].language = data.secondaryLanguage
    this[privSecondary].addWords(data.userWords || [])

    // Re-set the checker
    const language = this[privPrimary].language || this[privSecondary].language || window.navigator.language
    webFrame.setSpellCheckProvider(language, true, {
      spellCheck: (word) => {
        if (this[privPrimary].isConfiguredAndOk && this[privSecondary].isConfiguredAndOk) {
          return this._safeCheckWord(this[privPrimary], word) || this._safeCheckWord(this[privSecondary], word)
        } else if (this[privPrimary].isConfiguredAndOk) {
          return this._safeCheckWord(this[privPrimary], word)
        } else if (this[privSecondary].isConfiguredAndOk) {
          return this._safeCheckWord(this[privSecondary], word)
        } else {
          return true
        }
      }
    })
  }

  /**
  * @param spellchecker: the spellchecker to use
  * @param word: the word to check
  * @return true or false
  */
  _safeCheckWord (spellchecker, word) {
    try {
      return spellchecker.isCorrectSync(word)
    } catch (ex) {
      return true
    }
  }
}

export default Spellchecker
