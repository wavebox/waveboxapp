import { ipcMain, webContents } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import {
  WB_SPELLCHECKER_CONNECT,
  WB_SPELLCHECKER_CONFIGURE
} from 'shared/ipcEvents'
import { settingsStore } from 'stores/settings'
import DictionaryLoader from 'shared/SpellcheckProvider/DictionaryLoader'
import SpellcheckProvider from 'shared/SpellcheckProvider/SpellcheckProvider'
import RuntimePaths from 'Runtime/RuntimePaths'
import dictionaries from 'shared/SpellcheckProvider/dictionaries'

let Nodehun
try {
  Nodehun = require('nodehun')
} catch (ex) {}
const enUSDictionaryPath = path.join(__dirname, 'node_modules/dictionary-en-us')

const privDictionaryLoader = Symbol('privDictionaryLoader')
const privPrimary = Symbol('privPrimary')
const privSecondary = Symbol('privSecondary')
const privConnected = Symbol('privConnected')
const privUserWords = Symbol('privUserWords')
const privState = Symbol('privState')

class SpellcheckService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privDictionaryLoader] = new DictionaryLoader(enUSDictionaryPath, RuntimePaths.USER_DICTIONARIES_PATH)
    this[privPrimary] = new SpellcheckProvider(this[privDictionaryLoader], Nodehun)
    this[privSecondary] = new SpellcheckProvider(this[privDictionaryLoader], Nodehun)
    this[privUserWords] = new Set(this.loadUserWordsSync())

    this[privState] = (() => {
      const settingsState = settingsStore.getState()
      return {
        language: settingsState.language
      }
    })()
    settingsStore.listen(this._handleLanguageSettingsChanged)
    this.configureSpellcheckers(this[privState].language)

    this[privConnected] = new Set()
    ipcMain.on(WB_SPELLCHECKER_CONNECT, this._handleConnect)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get primaryLanguage () { return this[privPrimary].language }
  get secondaryLanguage () { return this[privSecondary].language }

  /* ****************************************************************************/
  // Data helpers
  /* ****************************************************************************/

  /**
  * Builds the payload for the spellcheck engine
  * @param language: the language object to build from
  * @return a payload that can be sent to the guest view
  */
  buildGuestConfigurePayload (language) {
    if (language.spellcheckerEnabled) {
      return {
        language: language.spellcheckerLanguage,
        secondaryLanguage: language.secondarySpellcheckerLanguage,
        userWords: Array.from(this[privUserWords])
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
      this[privPrimary].language = languageSettings.spellcheckerLanguage
      this[privPrimary].addWords(Array.from(this[privUserWords]))
      this[privSecondary].language = languageSettings.secondarySpellcheckerLanguage
      this[privSecondary].addWords(Array.from(this[privUserWords]))
    } else {
      this[privPrimary].language = null
      this[privSecondary].language = null
    }
  }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Handles a spellchecker connecting
  * @param evt: the event that fired
  */
  _handleConnect = (evt) => {
    const wc = evt.sender
    const id = wc.id

    if (!this[privConnected].has(id)) {
      this[privConnected].add(id)
      wc.on('destroyed', () => { this[privConnected].delete(id) })
      wc.on('dom-ready', () => { // Content popup windows seem to be more reliable with this
        wc.send(WB_SPELLCHECKER_CONFIGURE, this.buildGuestConfigurePayload(this[privState].language))
      })
    }

    wc.send(WB_SPELLCHECKER_CONFIGURE, this.buildGuestConfigurePayload(this[privState].language))
  }

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
      const payload = this.buildGuestConfigurePayload(next)
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
    // Primary
    let primary = null
    if (this[privPrimary].isConfiguredAndOk) {
      try {
        primary = {
          suggestions: this[privPrimary].spellSuggestionsSync(word),
          language: this[privPrimary].language
        }
      } catch (ex) {
        if (suppressErrors) {
          primary = {
            suggestions: [],
            language: this[privPrimary].language
          }
        } else {
          throw ex
        }
      }
    }

    // Secondary
    let secondary = null
    if (this[privSecondary].isConfiguredAndOk) {
      try {
        secondary = {
          suggestions: this[privSecondary].spellSuggestionsSync(word),
          language: this[privSecondary].language
        }
      } catch (ex) {
        if (suppressErrors) {
          secondary = {
            suggestions: [],
            language: this[privSecondary].language
          }
        } else {
          throw ex
        }
      }
    }

    return { primary, secondary }
  }

  /* ****************************************************************************/
  // User words
  /* ****************************************************************************/

  /**
  * Loads the user words from disk synchronously
  * @return a list of user words
  */
  loadUserWordsSync () {
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
  writeUserWordsSync (words, suppressErrors = true) {
    const data = words.join('\n')
    try {
      fs.writeFileSync(RuntimePaths.USER_DICTIONARY_WORDS_PATH, data)
    } catch (ex) {
      if (!suppressErrors) { throw ex }
    }
  }

  /**
  * Adds a user word
  * @param word: the user word
  */
  addUserWord (word) {
    word = word.trim()
    if (this[privUserWords].has(word)) { return }

    this[privUserWords].add(word)
    this.writeUserWordsSync(Array.from(this[privUserWords]))
    const payload = this.buildGuestConfigurePayload(this[privState].language)
    Array.from(this[privConnected]).forEach((id) => {
      webContents.fromId(id).send(WB_SPELLCHECKER_CONFIGURE, payload)
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
    return (dictionaries[language] || {}).name || language
  }

  /**
  * Gets a list of installed dictionaries
  * @return a list of installed dictionary info
  */
  getInstalledDictionaries () {
    return this[privDictionaryLoader].getInstalledDictionaries()
  }
}

export default SpellcheckService
