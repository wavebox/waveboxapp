const privPrimary = Symbol('privPrimary')
const privSecondary = Symbol('privSecondary')

class DualSpellcheckProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param primary: the primary spellcheck provider
  * @param secondayr: the secondary spellcheck provider
  */
  constructor (primary, secondary) {
    this[privPrimary] = primary
    this[privSecondary] = secondary
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get primary () { return this[privPrimary] }
  get secondary () { return this[privSecondary] }
  get isLoading () { return this.primary.isLoading || this.secondary.isLoading }
  get userWords () {
    return Array.from(new Set([].concat(
      this.primary.userWords,
      this.secondary.userWords
    )))
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
    if (this[privPrimary].isAvailable && this[privSecondary].isAvailable) {
      return this[privPrimary].isCorrect(word, suppressErrors) || this[privSecondary].isCorrect(word, suppressErrors)
    } else if (this[privPrimary].isAvailable) {
      return this[privPrimary].isCorrect(word, suppressErrors)
    } else if (this[privSecondary].isAvailable) {
      return this[privSecondary].isCorrect(word, suppressErrors)
    } else {
      return true
    }
  }

  /**
  * Gets spelling suggestions for a word synchronously
  * @param word: the word to get suggestions for
  * @param suppressErrors=false: set to true to gobble errors and return an empty list in that case
  * @return { primary, secondary } each with { suggestions: [], language: '' }
  */
  suggestions (word, suppressErrors = false) {
    return {
      primary: this[privPrimary].isAvailable ? {
        suggestions: this[privPrimary].suggestions(word, suppressErrors),
        language: this[privPrimary].language
      } : null,
      secondary: this[privSecondary].isAvailable ? {
        suggestions: this[privSecondary].suggestions(word, suppressErrors),
        language: this[privSecondary].language
      } : null
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
    this[privPrimary].addWord(word)
    this[privSecondary].addWord(word)
  }

  /**
  * Adds a set of words to the dictionary
  * @param words: the list of words to add
  */
  addWords (words) {
    this[privPrimary].addWords(words)
    this[privSecondary].addWords(words)
  }
}

export default DualSpellcheckProvider
