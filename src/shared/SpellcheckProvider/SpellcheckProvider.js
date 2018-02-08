const dictionaryExcludes = require('./dictionaryExcludes')

const privDictionaryLoader = Symbol('privDictionaryLoader')
const privNodehunLib = Symbol('privNodehunLib')
const privNodehun = Symbol('privNodehun')
const privLanguage = Symbol('privLanguage')
const privUserWords = Symbol('privUserWords')
const privNodehunInitFailed = Symbol('privNodehunInitFailed')
const privLRUCache = Symbol('privLRUCache')

class SpellcheckProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param DictionaryLoader: the dictionary loader
  * @param Nodehun: the nodehun library
  * @param lruCache=undefined: an optional cache to use
  * @param userWords=[]: a list of words provided by the user
  */
  constructor (DictionaryLoader, Nodehun, lruCache = undefined, userWords = []) {
    this[privDictionaryLoader] = DictionaryLoader
    this[privNodehunLib] = Nodehun
    this[privUserWords] = new Set(userWords)
    this[privNodehun] = null
    this[privNodehunInitFailed] = false
    this[privLanguage] = null
    this[privLRUCache] = lruCache
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isConfiguredAndOk () { return this.isConfigured && !this.didNodehunInitFail }

  /* **************************************************************************/
  // Properties: Language
  /* **************************************************************************/

  get language () { return this[privLanguage] }
  set language (l) {
    if (l === this[privLanguage]) { return }
    this[privLanguage] = l
    this[privNodehun] = null
    this[privNodehunInitFailed] = false
    if (this[privLRUCache]) {
      this[privLRUCache].reset()
    }
  }
  get isConfigured () { return !!this.language }

  /* **************************************************************************/
  // Properties: Spellchecker
  /* **************************************************************************/

  get nodehun () { return this[privNodehun] }
  get isNodehunLoaded () { return !!this.nodehun }
  get didNodehunInitFail () { return this[privNodehunInitFailed] }
  get loadedNodehun () {
    if (!this.isConfigured) { return null }
    if (!this[privNodehunLib]) { return null }
    if (this[privNodehunInitFailed]) { return null }

    if (!this[privNodehun]) {
      try {
        const Nodehun = this[privNodehunLib]
        const dic = this[privDictionaryLoader].loadSync(this.language)
        this[privNodehun] = new Nodehun(dic.aff, dic.dic)
        Array.from(this[privUserWords]).forEach((word) => {
          this[privNodehun].addWordSync(word)
        })
        this[privNodehunInitFailed] = false
      } catch (ex) {
        this[privNodehunInitFailed] = true
      }
    }

    return this[privNodehun]
  }

  /* **************************************************************************/
  // Checking & Suggestions
  /* **************************************************************************/

  /**
  * Checks if a word is correct synchronously
  * @param word: the word to check
  * @return true if correct or failed, false otherwise
  */
  isCorrectSync (word) {
    if (!this.isConfigured) { return false }
    if (dictionaryExcludes[this.language] && dictionaryExcludes[this.language].has(word.toLowerCase())) { return true }
    if (this[privLRUCache] && this[privLRUCache].peek(word) !== undefined) { return this[privLRUCache].get(word) }

    const spellchecker = this.loadedNodehun
    if (!spellchecker) { throw new Error('Failed to load spellchecker') }

    const res = spellchecker.isCorrectSync(word)
    if (this[privLRUCache]) { this[privLRUCache].set(word, res) }
    return res
  }

  /**
  * Gets spelling suggestions for a word
  * @param word: the word to get suggestions for
  * @return promise provded with the list of words
  */
  spellSuggestions (word) {
    if (!this.isConfigured) { return Promise.resolve([]) }

    const spellchecker = this.loadedNodehun
    if (!spellchecker) { return Promise.reject(new Error('Failed to load spellchecker')) }

    return new Promise((resolve, reject) => {
      spellchecker.spellSuggestions(word, (err, correct, suggestions) => {
        if (err) {
          reject(err)
        } else {
          resolve(suggestions)
        }
      })
    })
  }

  /**
  * Gets spelling suggestions for a word synchronously
  * @param word: the word to get suggestions for
  * @return a list of suggested words
  */
  spellSuggestionsSync (word) {
    if (!this.isConfigured) { return Promise.resolve([]) }

    const spellchecker = this.loadedNodehun
    if (!spellchecker) { throw new Error('Failed to load spellchecker') }

    return spellchecker.spellSuggestionsSync(word)
  }

  /* **************************************************************************/
  // User words
  /* **************************************************************************/

  /**
  * Adds a word to the spellchecker
  * @param word: the word to add
  * @return promise: on completion
  */
  addWord (word) {
    // Store the word in our list
    if (this[privUserWords].has(word)) { return Promise.resolve() }
    this[privUserWords].add(word)

    if (!this.isConfigured) { return Promise.resolve() }

    const spellchecker = this.loadedNodehun
    if (!spellchecker) { return Promise.reject(new Error('Failed to load spellchecker')) }

    return new Promise((resolve, reject) => {
      spellchecker.addWord(word, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
  * Adds a set of words to the dictionary
  * @param words: the list of words to add
  * @param ignoreErrors=true: true to ignore thrown errors
  * @return promise: on completion
  */
  addWords (words, ignoreErrors = true) {
    return words.reduce((acc, word) => {
      return acc
        .then(() => this.addWord(word))
        .catch((err) => {
          return ignoreErrors ? Promise.resolve() : Promise.reject(err)
        })
    }, Promise.resolve())
  }
}

module.exports = SpellcheckProvider
