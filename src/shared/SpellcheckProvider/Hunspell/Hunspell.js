import LRU from 'lru-cache'
import {EventEmitter} from 'events'
import HunspellFactory from './HunspellFactory'
import HunspellDictionaryBuffer from './HunspellDictionaryBuffer'
import dictionaryExcludes from '../dictionaryExcludes'

const privDestroyed = Symbol('privDestroyed')
const privLoaded = Symbol('privLoaded')
const privLanguage = Symbol('privLanguage')
const privDictionaryBuffer = Symbol('privDictionaryBuffer')
const privHunspellFactory = Symbol('privHunspellFactory')
const privHunspell = Symbol('privHunspell')
const privLRU = Symbol('privLRU')
const privUserWords = Symbol('privUserWords')

class Hunspell extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param language: the language of the spellchecker
  * @param affBuffer: the aff buffer file
  * @param dicBuffer: the dic buffer file
  */
  constructor (language, affBuffer, dicBuffer) {
    super()

    this[privDestroyed] = false
    this[privLoaded] = false
    this[privLanguage] = language
    this[privDictionaryBuffer] = new HunspellDictionaryBuffer(affBuffer, dicBuffer)
    this[privLRU] = new LRU({ max: 512, maxAge: 4000 })
    this[privHunspellFactory] = null
    this[privHunspell] = null
    this[privUserWords] = new Set()

    HunspellFactory.load().then(this._hunspellFactoryInitialized)
  }

  /**
  * Executed when the hunspell factory is initialized
  * @param factory: the factory instance
  */
  _hunspellFactoryInitialized = (factory) => {
    if (this[privDestroyed]) { return }

    this[privHunspellFactory] = factory
    this[privDictionaryBuffer].mount(factory)
    this[privHunspell] = factory.create(
      this[privDictionaryBuffer].affBuffer,
      this[privDictionaryBuffer].dicBuffer
    )
    this[privLoaded] = true

    this.emit('initialized', {})
  }

  /**
  * Destroys the instance
  */
  destroy () {
    this[privDestroyed] = true
    this[privDictionaryBuffer].destroy()
    if (this[privHunspell]) {
      this[privHunspell].dispose()
    }
    this[privUserWords].clear()

    this.emit('destroyed', {})
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get loaded () { return this[privLoaded] }
  get destroyed () { return this[privDestroyed] }
  get language () { return this[privLanguage] }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Throws if the lib is not available
  */
  _guardAvailability () {
    if (this.destroyed) {
      throw new Error('Hunspell has been destroyed')
    }
    if (!this.loaded) {
      throw new Error('Hunspell has not finished loading')
    }
  }

  /* **************************************************************************/
  // Checking
  /* **************************************************************************/

  /**
  * Checks if the word is correct in any of the addon modules we have
  * @param word: the word to check
  * @return true or false
  */
  _isAddonCorrect (word) {
    if (this[privUserWords].has(word)) { return true }
    if (dictionaryExcludes[this.language] && dictionaryExcludes[this.language].has(word.toLowerCase())) { return true }

    return false
  }

  /**
  * @param word: the word to check for corrections
  * @return true if the word is correct, false otherwise
  */
  isCorrect (word) {
    this._guardAvailability()

    if (this[privLRU].peek(word) !== undefined) { return this[privLRU].get(word) }
    const res = this._isAddonCorrect(word) || this[privHunspell].spell(word)
    this[privLRU].set(word, res)
    return res
  }

  /**
  * @param word: the word to get suggestions for
  * @return a list of suggestions
  */
  suggestions (word) {
    this._guardAvailability()

    return this[privHunspell].suggest(word)
  }

  /* **************************************************************************/
  // Custom words
  /* **************************************************************************/

  /**
  * Adds a word
  * @param word: the word to add
  */
  addWord (word) {
    this[privUserWords].add(word)
  }

  /**
  * Adds a set of words
  * @param words: an array of words
  */
  addWords (words) {
    words.forEach((word) => this.addWord(word))
  }
}

export default Hunspell
