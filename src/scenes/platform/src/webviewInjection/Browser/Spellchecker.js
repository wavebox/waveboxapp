const { webFrame, ipcRenderer, remote } = require('electron')
const DictionaryLoad = require('./DictionaryLoad')
const dictionaryExcludes = require('../../../../app/shared/dictionaryExcludes')
const elconsole = require('../elconsole')
const path = require('path')
const fs = require('../../../../app/node_modules/fs-extra')
const pkg = require('../../../../app/package.json')
const AppDirectory = require('../../../../app/node_modules/appdirectory')

let Nodehun
try {
  Nodehun = require('../../../../app/node_modules/nodehun')
} catch (ex) {
  elconsole.error('Failed to initialize spellchecker', ex)
  throw ex
}

const appDirectory = new AppDirectory({ appName: pkg.name, useRoaming: true }).userData()
const customWordsPath = path.join(appDirectory, 'user_dictionary_words.records')

class Spellchecker {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this._spellcheckers_ = {
      primary: { nodehun: null, language: null },
      secondary: { nodehun: null, language: null }
    }

    ipcRenderer.on('start-spellcheck', (evt, data) => {
      this._updateSpellchecker(data.language, data.secondaryLanguage)
    })
    ipcRenderer.on('dictionary-user-added-word', (evt, data) => {
      if (this._spellcheckers_.primary.nodehun) {
        this._addUserWordIntoSpellchecker(this._spellcheckers_.primary.nodehun, data.word)
      }
      if (this._spellcheckers_.secondary.nodehun) {
        this._addUserWordIntoSpellchecker(this._spellcheckers_.secondary.nodehun, data.word)
      }
    })
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get hasPrimarySpellchecker () { return this._spellcheckers_.primary.nodehun !== null }
  get hasSecondarySpellchecker () { return this._spellcheckers_.secondary.nodehun !== null }
  get hasSpellchecker () { return this.hasPrimarySpellchecker || this.hasSecondarySpellchecker }

  /* **************************************************************************/
  // Checking & Suggestions
  /* **************************************************************************/

  /**
  * Checks if a word is spelt correctly in one spellchecker
  * @param spellchecker: the reference to the spellchecker
  * @param text: the word to check
  * @return true if the work is correct
  */
  checkSpellcheckerWord (spellchecker, text) {
    if (spellchecker.language) {
      if (dictionaryExcludes[spellchecker.language] && dictionaryExcludes[spellchecker.language].has(text)) {
        return true
      } else {
        return spellchecker.nodehun.isCorrectSync(text)
      }
    } else {
      return true
    }
  }

  /**
  * Checks if a word is spelt correctly
  * @param text: the word to check
  * @return true if the work is correct
  */
  checkWord (text) {
    if (this.hasPrimarySpellchecker && this.hasSecondarySpellchecker) {
      return this.checkSpellcheckerWord(this._spellcheckers_.primary, text) ||
                this.checkSpellcheckerWord(this._spellcheckers_.secondary, text)
    } else if (this.hasPrimarySpellchecker) {
      return this.checkSpellcheckerWord(this._spellcheckers_.primary, text)
    } else if (this.hasSecondarySpellchecker) {
      return this.checkSpellcheckerWord(this._spellcheckers_.secondary, text)
    } else {
      return true
    }
  }

  /**
  * Gets a list of spelling suggestions
  * @param text: the text to get suggestions for
  * @return a list of words
  */
  suggestions (text) {
    return {
      primary: this.hasPrimarySpellchecker ? {
        language: this._spellcheckers_.primary.language,
        suggestions: this._spellcheckers_.primary.nodehun.spellSuggestionsSync(text)
      } : null,
      secondary: this.hasSecondarySpellchecker ? {
        language: this._spellcheckers_.secondary.language,
        suggestions: this._spellcheckers_.secondary.nodehun.spellSuggestionsSync(text)
      } : null
    }
  }

  /**
  * Adds a custom word into the dictionary
  * @param word: the word to add
  * @return promise
  */
  addCustomWord (word) {
    word = word.split(/(\s+)/)[0]
    return Promise.resolve()
      .then(() => fs.appendFile(customWordsPath, `\n${word}`))
      .then(() => {
        if (this._spellcheckers_.primary.nodehun) {
          return this._addUserWordIntoSpellchecker(this._spellcheckers_.primary.nodehun, word)
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        if (this._spellcheckers_.secondary.nodehun) {
          return this._addUserWordIntoSpellchecker(this._spellcheckers_.secondary.nodehun, word)
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        const currentWebContents = remote.getCurrentWebContents()
        remote.webContents.getAllWebContents().forEach((wc) => {
          if (wc !== currentWebContents) {
            wc.send('dictionary-user-added-word', { word: word })
          }
        })
        return Promise.resolve()
      })
  }

  /* **************************************************************************/
  // Updating spellchecker
  /* **************************************************************************/

  /**
  * Updates the provider by giving the languages as the primary language
  */
  _updateProvider () {
    const language = this._spellcheckers_.primary.language || window.navigator.language
    webFrame.setSpellCheckProvider(language, true, {
      spellCheck: (text) => { return this.checkWord(text) }
    })
  }

  /**
  * Updates the spellchecker with the correct language
  * @param primaryLanguage: the language to change the spellcheck to
  * @param secondaryLanguage: the secondary language to change the spellcheck to
  */
  _updateSpellchecker (primaryLanguage, secondaryLanguage) {
    if (!Nodehun) { return }

    if (this._spellcheckers_.primary.language !== primaryLanguage) {
      if (!primaryLanguage) {
        this._spellcheckers_.primary.language = null
        this._spellcheckers_.primary.nodehun = undefined
      } else {
        this._spellcheckers_.primary.language = primaryLanguage
        DictionaryLoad.load(primaryLanguage).then((dic) => {
          this._spellcheckers_.primary.nodehun = new Nodehun(dic.aff, dic.dic)
          this._updateProvider()
          this._loadUserWordsIntoSpellchecker(this._spellcheckers_.primary.nodehun)
        }, (err) => elconsole.error('Failed to load dictionary', err))
      }
    }

    if (this._spellcheckers_.secondary.language !== secondaryLanguage) {
      if (!secondaryLanguage) {
        this._spellcheckers_.secondary.language = null
        this._spellcheckers_.secondary.nodehun = undefined
      } else {
        this._spellcheckers_.secondary.language = secondaryLanguage
        DictionaryLoad.load(secondaryLanguage).then((dic) => {
          this._spellcheckers_.secondary.nodehun = new Nodehun(dic.aff, dic.dic)
          this._loadUserWordsIntoSpellchecker(this._spellcheckers_.secondary.nodehun)
        }, (err) => elconsole.error('Failed to load dictionary', err))
      }
    }
  }

  /* **************************************************************************/
  // User words
  /* **************************************************************************/

  /**
  * Loads the custom words into the given spellchecker
  * @param spellchecker: the spellchecker instance to load into
  * @return promise on completion or error
  */
  _loadUserWordsIntoSpellchecker (spellchecker) {
    return Promise.resolve()
      .then(() => fs.readFile(customWordsPath, 'utf8'))
      .then((d) => d.split('\n'), () => Promise.resolve([]))
      .then((words) => {
        return Promise.all(
          words
            .filter((w) => !!w)
            .map((w) => this._addUserWordIntoSpellchecker(spellchecker, w))
        )
      })
  }

  /**
  * Adds a custom word into the spellchecker
  * @param spellchecker: the spellchecker instance
  * @param word: the word to add
  * @return promise
  */
  _addUserWordIntoSpellchecker (spellchecker, word) {
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
}

module.exports = Spellchecker
