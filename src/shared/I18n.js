import fs from 'fs'
import path from 'path'
import electron from 'electron'

const privTransDict = Symbol('privTransDict')
const privLocalesPath = Symbol('privLocalesPath')
const privLangCode = Symbol('privLangCode')
const LOCALES = Object.freeze({
  'cy': ['Welsh', 'Cymraeg'],
  'de': ['German', 'Deutsch']
})
const LOCALE_CODES = new Set(Object.keys(LOCALES))
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
  * Initializes grabbing language settings etc from the store
  * @param localesPath: the path to the locale files
  * @param settingsStore: the store to use to configure
  */
  autoInitialize (localesPath, settingsStore) {
    if (process.type === 'renderer') {
      this.initialize(
        localesPath,
        settingsStore.getState().launched.language.uiLanguage || electron.remote.app.getLocale()
      )
    } else {
      let appLocale
      try {
        appLocale = electron.app.getLocale()
      } catch (ex) {
        appLocale = 'en_US'
      }
      this.initialize(
        localesPath,
        settingsStore.getState().launched.language.uiLanguage || appLocale
      )
    }
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
  get localeCodes () { return Array.from(LOCALE_CODES) }
  get locales () { return LOCALES }
  get localeCodesSorted () { return this.localeCodes.sort() }

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
      if (LOCALE_CODES.has(langCode)) {
        return langCode
      } else if (langCode.length > 2) {
        const short = langCode.substr(0, 2)
        if (LOCALE_CODES.has(short)) {
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

  /* **************************************************************************/
  // Language codes
  /* **************************************************************************/

  /**
  * @param code: the language code
  * @return the native language name
  */
  getNativeLanguageName (code) {
    return LOCALES[code] ? LOCALES[code][1] : code
  }
}

export default I18n
