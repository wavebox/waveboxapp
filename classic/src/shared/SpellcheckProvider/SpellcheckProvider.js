import Hunspell from './Hunspell'

const privDictionaryProvider = Symbol('privDictionaryProvider')
const privUserWords = Symbol('privUserWords')
const privHunspell = Symbol('privHunspell')
const privLanguage = Symbol('privLanguage')

class SpellcheckProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param dictionaryProvider: the dictionary provider
  * @param userWords=[]: a list of words provided by the user
  */
  constructor (dictionaryProvider, userWords = []) {
    this[privDictionaryProvider] = dictionaryProvider
    this[privUserWords] = new Set(userWords)
    this[privHunspell] = undefined
    this[privLanguage] = undefined
  }

  /**
  * Destroys the current hunspell instance
  */
  _destroyHunspell () {
    if (this[privHunspell]) {
      this[privHunspell].destroy()
      this[privHunspell] = undefined
    }
  }

  /**
  * Creates the hunspell instance
  */
  _createHunspell () {
    if (this[privHunspell]) {
      throw new Error('Call _destroyHunspell before attempting to create a second instance')
    }
    if (!this.language) {
      throw new Error('Set language before calling _createHunspell')
    }

    const dictionaries = this[privDictionaryProvider].loadDictionarySync(this.language)
    if (dictionaries) {
      this[privHunspell] = new Hunspell(this.language, dictionaries.aff, dictionaries.dic)
      this[privHunspell].addWords(Array.from(this[privUserWords]))
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get language () { return this[privLanguage] }
  set language (l) {
    if (l === this[privLanguage]) { return }
    // Teardown
    if (this[privLanguage]) {
      this[privDictionaryProvider].unloadDictionarySync()
    }
    this._destroyHunspell()

    // Set-up
    this[privLanguage] = l
    if (this[privLanguage]) {
      this._createHunspell()
    }
  }
  get isAvailable () {
    if (!this[privHunspell]) { return false }
    if (!this[privHunspell].loaded) { return false }
    return true
  }
  get isLoading () {
    if (!this.language) { return false }
    return !this.isAvailable
  }
  get dictionaryProvider () { return this[privDictionaryProvider] }
  get userWords () { return Array.from(this[privUserWords]) }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  _guardAvailability () {
    if (!this.isAvailable) {
      throw new Error('Spellchecker is not yet available')
    }
  }

  /* **************************************************************************/
  // Checking & Suggestions
  /* **************************************************************************/

  /**
  * Checks if a word is correct synchronously
  * @param word: the word to check
  * @param suppressErrors=false: set to true to gobble errors and return true in that case
  * @return true if correct or failed, false otherwise
  */
  isCorrect (word, suppressErrors = false) {
    try {
      this._guardAvailability()
      return this[privHunspell].isCorrect(word)
    } catch (ex) {
      if (suppressErrors) { return true }
      throw ex
    }
  }

  /**
  * Gets spelling suggestions for a word synchronously
  * @param word: the word to get suggestions for
  * @param suppressErrors=false: set to true to gobble errors and return an empty list in that case
  * @return a list of suggested words
  */
  suggestions (word, suppressErrors = false) {
    try {
      this._guardAvailability()
      return this[privHunspell].suggestions(word)
    } catch (ex) {
      if (suppressErrors) { return [] }
      throw ex
    }
  }

  /* **************************************************************************/
  // User words
  /* **************************************************************************/

  /**
  * Adds a word to the spellchecker
  * @param word: the word to add
  */
  addWord (word) {
    this[privUserWords].add(word)
    if (this[privHunspell]) {
      this[privHunspell].addWord(word)
    }
  }

  /**
  * Adds a set of words to the dictionary
  * @param words: the list of words to add
  */
  addWords (words) {
    words.forEach((word) => {
      this[privUserWords].add(word)
    })
    if (this[privHunspell]) {
      this[privHunspell].addWords(words)
    }
  }
}

export default SpellcheckProvider
