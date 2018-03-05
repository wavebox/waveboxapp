import { webFrame, ipcRenderer } from 'electron'
import SpellcheckProvider from 'shared/SpellcheckProvider/SpellcheckProvider'
import DualSpellcheckProvider from 'shared/SpellcheckProvider/DualSpellcheckProvider'
import DictionaryProviderImpl from './DictionaryProviderImpl'
import LRU from 'lru-cache'
import {
  WB_SPELLCHECKER_CONNECT,
  WB_SPELLCHECKER_CONFIGURE,
  WB_SPELLCHECKER_INIT,
  WB_SPELLCHECKER_INIT_CONFIGURE,
  WB_SPELLCHECKER_CHECK_SPELLING_SYNC,
  WB_SPELLCHECKER_GET_PRIMARY_DICTIONARY_SYNC,
  WB_SPELLCHECKER_GET_SECONDARY_DICTIONARY_SYNC
} from 'shared/ipcEvents'

const privProvider = Symbol('privProvider')
const privHasStartedInit = Symbol('privHasStartedInit')
const privWebFrameLanguage = Symbol('privWebFrameLanguage')
const privRemoteLRU = Symbol('privRemoteLRU')

class Spellchecker {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privWebFrameLanguage] = undefined
    this[privHasStartedInit] = false
    this[privProvider] = undefined
    this[privRemoteLRU] = new LRU({ max: 512, maxAge: 10000 }) // Heavily cache this

    ipcRenderer.on(WB_SPELLCHECKER_CONFIGURE, this._handleRuntimeConfigure)
    ipcRenderer.on(WB_SPELLCHECKER_INIT_CONFIGURE, this._handleRuntimeInitConfigure)

    // Requeue to ensure the bridge is initialized
    setTimeout(() => {
      ipcRenderer.send(WB_SPELLCHECKER_CONNECT, {})
    })
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isRunningLocally () { return !!this[privProvider] }
  get hasStartedInit () { return this[privHasStartedInit] }

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Handles the init configure call happening
  */
  _handleRuntimeInitConfigure = (evt, data) => {
    // Start our local provider
    this[privProvider] = new DualSpellcheckProvider(
      new SpellcheckProvider(new DictionaryProviderImpl(WB_SPELLCHECKER_GET_PRIMARY_DICTIONARY_SYNC, data.primaryDictionary)),
      new SpellcheckProvider(new DictionaryProviderImpl(WB_SPELLCHECKER_GET_SECONDARY_DICTIONARY_SYNC, data.secondaryDictionary))
    )
    this[privRemoteLRU] = undefined

    // Now we're running locally, just pass the args through to normal configure
    this._handleRuntimeConfigure(evt, data)
  }

  /**
  * Configures the runtime dictionaries
  * @param evt: the event that fired
  * @param data: the configuration
  */
  _handleRuntimeConfigure = (evt, data) => {
    // Configure our local instances
    if (this.isRunningLocally) {
      this[privProvider].primary.language = data.language
      this[privProvider].secondary.language = data.secondaryLanguage
      this[privProvider].addWords(data.userWords || [])
    }

    // Lazily reset the LRU, it should be short lived so don't worry about it too much
    if (this[privRemoteLRU]) {
      this[privRemoteLRU].reset()
    }

    const language = data.language || data.secondaryLanguage || window.navigator.language
    this._bindToWebFrame(language)
  }

  /* **************************************************************************/
  // Spellcheck events
  /* **************************************************************************/

  /**
  * Configures the webframe on language change
  * @param language: the new language to run on
  */
  _bindToWebFrame (language) {
    if (language !== this[privWebFrameLanguage]) {
      this[privWebFrameLanguage] = language
      webFrame.setSpellCheckProvider(language, true, {
        spellCheck: this._checkSpelling
      })
    }
  }

  /**
  * Does the heavy lifting of checking for spelling
  * @param word: the word to check
  * @return true or false
  */
  _checkSpelling = (word) => {
    if (this.isRunningLocally && !this[privProvider].isLoading) {
      return this[privProvider].isCorrect(word, true)
    } else {
      if (!this.hasStartedInit) {
        this[privHasStartedInit] = true
        ipcRenderer.send(WB_SPELLCHECKER_INIT, {})
      }

      if (this[privRemoteLRU]) {
        if (this[privRemoteLRU].peek(word) !== undefined) {
          return this[privRemoteLRU].get(word)
        }
        const res = ipcRenderer.sendSync(WB_SPELLCHECKER_CHECK_SPELLING_SYNC, word)
        this[privRemoteLRU].set(word, res)
        return res
      } else {
        return ipcRenderer.sendSync(WB_SPELLCHECKER_CHECK_SPELLING_SYNC, word)
      }
    }
  }
}

export default Spellchecker
