const { webFrame, ipcRenderer } = require('electron')
const req = require('../req')
const elconsole = require('../elconsole')
const path = require('path')
const SpellcheckProvider = req.shared('SpellcheckProvider/SpellcheckProvider')
const DictionaryLoader = req.shared('SpellcheckProvider/DictionaryLoader')
const {
  WB_SPELLCHECKER_CONNECT,
  WB_SPELLCHECKER_CONFIGURE
} = req.shared('ipcEvents')
const { USER_DICTIONARIES_PATH } = req.runtimePaths()

let Nodehun
try {
  Nodehun = req.appNodeModules('nodehun')
} catch (ex) {
  elconsole.error('Failed to load spellchecker', ex)
}

const enUSDictionaryPath = path.dirname(req.appNodeModulesPath('dictionary-en-us'))
const privDictionaryLoader = Symbol('privDictionaryLoader')
const privPrimary = Symbol('privPrimary')
const privSecondary = Symbol('privSecondary')

class Spellchecker {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privDictionaryLoader] = new DictionaryLoader(enUSDictionaryPath, USER_DICTIONARIES_PATH)
    this[privPrimary] = new SpellcheckProvider(this[privDictionaryLoader], Nodehun)
    this[privSecondary] = new SpellcheckProvider(this[privDictionaryLoader], Nodehun)

    if (Nodehun) {
      ipcRenderer.on(WB_SPELLCHECKER_CONFIGURE, this._handleRuntimeConfigure.bind(this))
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
  _handleRuntimeConfigure (evt, data) {
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

module.exports = Spellchecker
