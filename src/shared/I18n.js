import fs from 'fs'
import path from 'path'

const privTransDict = Symbol('privTransDict')
const privLocalesPath = Symbol('privLocalesPath')
const privLangCode = Symbol('privLangCode')
const LOCALES = new Set([
  'en_US',
  'de'
])
let hasWarnedInitFailure = false

class I18n {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privTransDict] = undefined
    this[privLocalesPath] = undefined
    this[privLangCode] = undefined
  }

  /**
  * @param localesPath: the path to the locale files
  * @param lang: the language to use
  */
  initialize (localesPath, lang) {
    if (this.isInitialized) { throw new Error('Initialize called twice on I18n') }
    this[privLocalesPath] = localesPath
    this[privLangCode] = lang
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isInitialized () { return this[privLocalesPath] !== undefined }
  get isLoaded () { return this[privTransDict] !== undefined }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * @param lang: the lang to get
  * @return a known language code or undefined
  */
  _getKnownLang (lang) {
    if (typeof (lang) === 'string') {
      const langCode = lang.replace(/-/g, '_')
      if (LOCALES.has(langCode)) {
        return langCode
      } else if (langCode.length > 2) {
        const short = langCode.substr(0, 2)
        if (LOCALES.has(short)) {
          return short
        }
      }
    }

    return undefined
  }

  /* **************************************************************************/
  // Trans
  /* **************************************************************************/

  /**
  * Translates the given string
  * @param str: the string to translate
  * @return the translated version
  */
  T = (str) => {
    if (this.isLoaded) {
      return this[privTransDict][str] || str
    } else {
      if (this.isInitialized) {
        const knownCode = this._getKnownLang(this[privLangCode])
        console.log(">>", this[privLangCode], knownCode)
        if (knownCode) {
          try {
            this[privTransDict] = JSON.parse(fs.readFileSync(path.join(this[privLocalesPath], `${knownCode}.json`)))
          } catch (ex) {
            console.warn(`Failed to load i18n dictionary for ${this[privLangCode]}/${knownCode}`)
            this[privTransDict] = {}
          }
        } else {
          this[privTransDict] = {}
        }
        return this[privTransDict][str] || str
      } else {
        if (hasWarnedInitFailure === false) {
          hasWarnedInitFailure = true
          console.warn('i18n.T() was called before i18n.initialize(). This log will only be shown once')
        }
        return str
      }
    }
  }
  t = this.T
}

export default I18n
