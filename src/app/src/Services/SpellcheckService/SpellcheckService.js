import { ipcMain, webContents } from 'electron'
import {
  WB_SPELLCHECKER_CONNECT,
  WB_SPELLCHECKER_CONFIGURE,
  WB_SPELLCHECKER_INIT,
  WB_SPELLCHECKER_INIT_CONFIGURE,
  WB_SPELLCHECKER_CHECK_SPELLING_SYNC,
  WB_SPELLCHECKER_GET_PRIMARY_DICTIONARY_SYNC,
  WB_SPELLCHECKER_GET_SECONDARY_DICTIONARY_SYNC
} from 'shared/ipcEvents'
import { settingsStore } from 'stores/settings'
import SpellcheckProvider from 'shared/SpellcheckProvider/SpellcheckProvider'
import DualSpellcheckProvider from 'shared/SpellcheckProvider/DualSpellcheckProvider'
import DictionaryProviderImpl from './DictionaryProviderImpl'
import DictionaryLoader from './DictionaryLoader'

const privProvider = Symbol('privProvider')
const privConnected = Symbol('privConnected')
const privState = Symbol('privState')

class SpellcheckService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    const userWords = DictionaryLoader.loadUserWordsSync()
    this[privProvider] = new DualSpellcheckProvider(
      new SpellcheckProvider(new DictionaryProviderImpl(), userWords),
      new SpellcheckProvider(new DictionaryProviderImpl(), userWords)
    )

    this[privState] = (() => {
      const settingsState = settingsStore.getState()
      return {
        language: settingsState.language
      }
    })()
    settingsStore.listen(this._handleLanguageSettingsChanged)
    this.configureSpellcheckers(this[privState].language)

    this[privConnected] = new Set()
    ipcMain.on(WB_SPELLCHECKER_CONNECT, this._handleIPCConnect)
    ipcMain.on(WB_SPELLCHECKER_INIT, this._handleIPCInit)
    ipcMain.on(WB_SPELLCHECKER_CHECK_SPELLING_SYNC, this._handleIPCCheckSpellingSync)
    ipcMain.on(WB_SPELLCHECKER_GET_PRIMARY_DICTIONARY_SYNC, this._handleIPCGetPrimaryDictionarySync)
    ipcMain.on(WB_SPELLCHECKER_GET_SECONDARY_DICTIONARY_SYNC, this._handleIPCGetSecondaryDictionarySync)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get primaryLanguage () { return this[privProvider].primary.language }
  get secondaryLanguage () { return this[privProvider].secondary.language }

  /* ****************************************************************************/
  // Data helpers
  /* ****************************************************************************/

  /**
  * Builds the payload for the spellcheck engine
  * @param language: the language object to build from
  * @return a payload that can be sent to the guest view
  */
  _buildIPCConfigurePayload (languageSettings) {
    if (languageSettings.spellcheckerEnabled) {
      return {
        language: languageSettings.spellcheckerLanguage,
        secondaryLanguage: languageSettings.secondarySpellcheckerLanguage,
        userWords: this[privProvider].userWords
      }
    } else {
      return { language: null, secondaryLanguage: null }
    }
  }

  /* ****************************************************************************/
  // Configuration
  /* ****************************************************************************/

  /**
  * Configures the spellcheckers
  * @param languageSettings: the current language settings
  */
  configureSpellcheckers (languageSettings) {
    if (languageSettings.spellcheckerEnabled) {
      this[privProvider].primary.language = languageSettings.spellcheckerLanguage
      this[privProvider].secondary.language = languageSettings.secondarySpellcheckerLanguage
    } else {
      this[privProvider].primary.language = null
      this[privProvider].secondary.language = null
    }
  }

  /* ****************************************************************************/
  // IPC Event handlers
  /* ****************************************************************************/

  /**
  * Handles a spellchecker connecting
  * @param evt: the event that fired
  */
  _handleIPCConnect = (evt) => {
    const wc = evt.sender
    const id = wc.id

    if (!this[privConnected].has(id)) {
      this[privConnected].add(id)
      wc.on('destroyed', () => { this[privConnected].delete(id) })
      wc.on('dom-ready', () => { // Content popup windows seem to be more reliable with this
        wc.send(WB_SPELLCHECKER_CONFIGURE, this._buildIPCConfigurePayload(this[privState].language))
      })
    }

    wc.send(WB_SPELLCHECKER_CONFIGURE, this._buildIPCConfigurePayload(this[privState].language, true))
  }

  /**
  * Handles the spellchecker initializing
  * @param evt: the event that fired
  */
  _handleIPCInit = (evt) => {
    const senderId = evt.sender.id
    setTimeout(() => { // Wait a small amount of time to reduce jank when the user is typing
      const target = webContents.fromId(senderId)
      if (target.isDestroyed()) { return }

      const languageSettings = this[privState].language
      if (languageSettings.spellcheckerEnabled) {
        target.send(WB_SPELLCHECKER_INIT_CONFIGURE, {
          ...this._buildIPCConfigurePayload(languageSettings),
          primaryDictionary: this[privProvider].primary.dictionaryProvider.getCached(),
          secondaryDictionary: this[privProvider].secondary.dictionaryProvider.getCached()
        })
      } else {
        target.send(WB_SPELLCHECKER_INIT_CONFIGURE, {
          language: null,
          secondaryLanguage: null
        })
      }
    }, 500)
  }

  /**
  * Gets the primary dictionary data
  * @param evt: the event that fired
  */
  _handleIPCGetPrimaryDictionarySync = (evt) => {
    try {
      evt.returnValue = this[privProvider].primary.dictionaryProvider.getCached()
    } catch (ex) {
      console.error(`Failed to respond to "${WB_SPELLCHECKER_GET_PRIMARY_DICTIONARY_SYNC}" continuing with unkown side effects`, ex)
      evt.returnValue = null
    }
  }

  /**
  * Gets the secondary dictionary data
  * @param evt: the event that fired
  */
  _handleIPCGetSecondaryDictionarySync = (evt) => {
    try {
      evt.returnValue = this[privProvider].secondary.dictionaryProvider.getCached()
    } catch (ex) {
      console.error(`Failed to respond to "${WB_SPELLCHECKER_GET_SECONDARY_DICTIONARY_SYNC}" continuing with unkown side effects`, ex)
      evt.returnValue = null
    }
  }

  /**
  * Checks the correctness of a spelling
  * @param evt: the event that fired
  * @param word: the word to check
  */
  _handleIPCCheckSpellingSync = (evt, word) => {
    try {
      evt.returnValue = this[privProvider].isCorrect(word, true)
    } catch (ex) {
      console.error(`Failed to respond to "${WB_SPELLCHECKER_CHECK_SPELLING_SYNC}" continuing with unkown side effects`, ex)
      evt.returnValue = true
    }
  }

  /* ****************************************************************************/
  // Store Event Handlers
  /* ****************************************************************************/

  /**
  * Handles the language settings changing
  * @param settingsState: the new state of settings
  */
  _handleLanguageSettingsChanged = (settingsState) => {
    const prev = this[privState].language
    const next = settingsState.language
    const storeChangedKey = [
      'spellcheckerEnabled',
      'spellcheckerLanguage',
      'secondarySpellcheckerLanguage'
    ].find((k) => prev[k] !== next[k])

    if (storeChangedKey) {
      this[privState].language = next
      const payload = this._buildIPCConfigurePayload(next)
      Array.from(this[privConnected]).forEach((id) => {
        webContents.fromId(id).send(WB_SPELLCHECKER_CONFIGURE, payload)
      })
      this.configureSpellcheckers(next)
    }
  }

  /* ****************************************************************************/
  // Suggestions
  /* ****************************************************************************/

  /**
  * Gets spellchecking suggestions synchronously
  * @param word: the word to check for
  * @param suppressErrors=true: true to suppress errors
  * @return the correction configuration
  */
  spellSuggestionsSync (word, suppressErrors = true) {
    return this[privProvider].suggestions(word, suppressErrors)
  }

  /* ****************************************************************************/
  // User words
  /* ****************************************************************************/

  /**
  * Adds a user word
  * @param word: the user word
  */
  addUserWord (word) {
    // Check if we already have the word
    word = word.trim()
    const prevUserWords = new Set(DictionaryLoader.loadUserWordsSync())
    if (prevUserWords.has(word)) { return }

    // Add and write the word
    prevUserWords.add(word)
    DictionaryLoader.writeUserWordsSync(Array.from(prevUserWords))

    // Update all our in memory providers
    this[privProvider].addWord(word)
    const payload = this._buildIPCConfigurePayload(this[privState].language)
    Array.from(this[privConnected]).forEach((id) => {
      const wc = webContents.fromId(id)
      if (wc && !wc.isDestroyed()) {
        wc.send(WB_SPELLCHECKER_CONFIGURE, payload)
      }
    })
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * Gets the humanized language name
  * @param language: the language to get the humanized version of
  * @return a humanized version
  */
  getHumanizedLanguageName (language) {
    return DictionaryLoader.getHumanizedLanguageName(language)
  }

  /**
  * Gets a list of installed dictionaries
  * @return a list of installed dictionary info
  */
  getInstalledDictionaries () {
    return DictionaryLoader.getInstalledDictionaries()
  }
}

export default SpellcheckService
