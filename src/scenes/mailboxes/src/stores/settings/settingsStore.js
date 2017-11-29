import alt from '../alt'
import actions from './settingsActions'
import persistence from './settingsPersistence'
import dictionaries from 'shared/SpellcheckProvider/dictionaries.js'
import fs from 'fs'
import {
  AcceleratorSettings,
  AppSettings,
  ExtensionSettings,
  LanguageSettings,
  OSSettings,
  NewsSettings,
  TraySettings,
  UISettings,
  SettingsIdent
} from 'shared/Models/Settings'
import { NEWS_SYNC_PERIOD } from 'shared/constants'
import { TOUR_STEPS, TOUR_STEPS_ORDER } from './Tour'
import WaveboxHTTP from 'Server/WaveboxHTTP'
import { remote } from 'electron'
import pkg from 'package.json'
import homeDir from 'home-dir'

const { systemPreferences } = remote

class SettingsStore {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * Generates the themed defaults for the tray
  * @return the defaults
  */
  static generateTrayThemedDefaults () {
    if (process.platform === 'darwin') {
      const isDarkMode = systemPreferences.isDarkMode()
      return {
        readColor: isDarkMode ? '#FFFFFF' : '#000000',
        readBackgroundColor: 'transparent',
        unreadColor: isDarkMode ? '#FFFFFF' : '#000000',
        unreadBackgroundColor: 'transparent'
      }
    } else if (process.platform === 'win32') {
      // Windows is predominantely dark themed, but with no way to check assume it is
      return {
        readColor: '#FFFFFF',
        readBackgroundColor: '#00AEEF',
        unreadColor: '#FFFFFF',
        unreadBackgroundColor: '#00AEEF'
      }
    } else if (process.platform === 'linux') {
      let isDark = false
      // GTK
      try {
        const gtkConf = fs.readFileSync(homeDir('.config/gtk-3.0/settings.ini'), 'utf8')
        if (gtkConf.indexOf('gtk-application-prefer-dark-theme=1') !== -1) {
          isDark = true
        }
      } catch (ex) { }

      if (isDark) {
        return {
          readColor: '#FFFFFF',
          readBackgroundColor: 'transparent',
          unreadColor: '#FFFFFF',
          unreadBackgroundColor: 'transparent'
        }
      } else {
        return {
          readColor: '#FFFFFF',
          readBackgroundColor: '#00AEEF',
          unreadColor: '#FFFFFF',
          unreadBackgroundColor: '#00AEEF'
        }
      }
    } else {
      return { }
    }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.accelerators = null
    this.app = null
    this.extension = null
    this.language = null
    this.news = null
    this.os = null
    this.tray = null
    this.ui = null

    this.launched = {
      accelerators: null,
      app: null,
      extension: null,
      language: null,
      news: null,
      os: null,
      tray: null,
      ui: null
    }

    this.newsSync = null
    this.tourStep = TOUR_STEPS.NONE

    /* ****************************************/
    // Export
    /* ****************************************/

    /**
    * Exports the data synchronously
    * @return the raw data
    */
    this.exportDataSync = () => {
      return persistence.allItemsSync()
    }

    /* ****************************************/
    // News
    /* ****************************************/

    /**
    * @return true if the news is being synced
    */
    this.isSyncingNews = () => { return this.newsSync !== null }

    /* ****************************************/
    // Tour
    /* ****************************************/

    /**
    * @return true if the tour is active
    */
    this.isTourActive = () => this.tourStep !== TOUR_STEPS.NONE

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleLoad: actions.LOAD,

      handleStartSyncingNews: actions.START_SYNCING_NEWS,
      handleStopSyncingNews: actions.STOP_SYNCING_NEWS,
      handleOpenAndMarkNews: actions.OPEN_AND_MARK_NEWS,

      handleTourStart: actions.TOUR_START,
      handleTourNext: actions.TOUR_NEXT,
      handleTourQuit: actions.TOUR_QUIT,

      handleUpdate: actions.UPDATE,
      handleToggleBool: actions.TOGGLE,

      handleSetHasSeenAppWizard: actions.SET_HAS_SEEN_APP_WIZARD,
      handleSetSpellcheckerLanguage: actions.SET_SPELLCHECKER_LANGUAGE,
      handleSetSecondarySpellcheckerLanguage: actions.SET_SECONDARY_SPELLCHECKER_LANGUAGE
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad () {
    // Migrate
    this.trayDefaults = SettingsStore.generateTrayThemedDefaults()

    // Load everything
    this.accelerators = new AcceleratorSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.ACCELERATORS, {}))
    this.app = new AppSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.APP, {}), pkg)
    this.extension = new ExtensionSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.EXTENSION, {}))
    this.language = new LanguageSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.LANGUAGE, {}))
    this.news = new NewsSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.NEWS, {}))
    this.os = new OSSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.OS, {}))
    this.tray = new TraySettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.TRAY, {}), this.trayDefaults)
    this.ui = new UISettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.UI, {}))

    this.launched = {
      accelerators: this.accelerators,
      app: this.app,
      extension: this.extension,
      language: this.language,
      news: this.news,
      os: this.os,
      tray: this.tray,
      ui: this.ui
    }

    actions.startSyncingNews.defer()
  }

  /* **************************************************************************/
  // News Sync
  /* **************************************************************************/

  /**
  * Gets the latest news info from the server and updates the store
  * with the given response
  */
  _syncNews () {
    WaveboxHTTP.fetchLatestNewsHeading()
      .then((res) => {
        actions.update.defer(SettingsIdent.SEGMENTS.NEWS, {
          latestTimestamp: res.latest.timestamp,
          latestHeadline: res.latest.headline,
          latestSummary: res.latest.summary
        })
      })
      .catch(() => { /* no-op */ })
  }

  handleStartSyncingNews () {
    if (this.isSyncingNews()) {
      this.preventDefault()
      return
    }

    this.newsSync = setInterval(() => {
      this._syncNews()
    }, NEWS_SYNC_PERIOD)
    this._syncNews()
  }

  handleStopSyncingNews () {
    clearTimeout(this.newsSync)
  }

  handleOpenAndMarkNews () {
    this.preventDefault()
    window.location.hash = '/news'
    if (this.news.hasLatestInfo) {
      actions.update.defer(SettingsIdent.SEGMENTS.NEWS, {
        lastSeenTimestamp: this.news.latestTimestamp
      })
    }
  }

  /* **************************************************************************/
  // Tour
  /* **************************************************************************/

  handleTourStart () {
    this.preventDefault()
    if (this.app.hasSeenAppTour) { return }
    this.tourStep = TOUR_STEPS.NONE
    actions.tourNext.defer()
  }

  handleTourNext () {
    const currentIndex = TOUR_STEPS_ORDER.findIndex((step) => step === this.tourStep)
    const nextStep = TOUR_STEPS_ORDER.find((step, index) => {
      if (index <= currentIndex) { return false }

      if (step === TOUR_STEPS.WHATS_NEW) {
        if (this.ui.showSidebarNewsfeed) { return true }
      } else if (step === TOUR_STEPS.APP_WIZARD) {
        if (!this.app.hasSeenAppWizard) { return true }
      } else if (step === TOUR_STEPS.SUPPORT_CENTER) {
        if (this.ui.showSidebarSupport) { return true }
      } else {
        return true
      }
    })

    if (nextStep) {
      this.tourStep = nextStep
    } else {
      this.tourStep = TOUR_STEPS.NONE
      actions.setHasSeenTour.defer(true)
    }
  }

  handleTourQuit () {
    this.preventDefault()
    this.tourStep = TOUR_STEPS.NONE
    actions.setHasSeenTour.defer(true)
  }

  /* **************************************************************************/
  // Class Mapping
  /* **************************************************************************/

  /**
  * @param segment: the segment string
  * @return the store class for this segment
  */
  storeClassFromSegment (segment) {
    switch (segment) {
      case SettingsIdent.SEGMENTS.ACCELERATORS: return AcceleratorSettings
      case SettingsIdent.SEGMENTS.APP: return AppSettings
      case SettingsIdent.SEGMENTS.EXTENSION: return ExtensionSettings
      case SettingsIdent.SEGMENTS.LANGUAGE: return LanguageSettings
      case SettingsIdent.SEGMENTS.NEWS: return NewsSettings
      case SettingsIdent.SEGMENTS.OS: return OSSettings
      case SettingsIdent.SEGMENTS.TRAY: return TraySettings
      case SettingsIdent.SEGMENTS.UI: return UISettings
      default: throw new Error('Unknown Settings Segment')
    }
  }

  /**
  * Creates a new store object for the given segment
  * @param segment: the segment string
  * @param data: the config data for the store
  * @return the built model
  */
  createStore (segment, data) {
    const StoreClass = this.storeClassFromSegment(segment)
    if (segment === SettingsIdent.SEGMENTS.TRAY) {
      return new StoreClass(data, this.trayDefaults)
    } else if (segment === SettingsIdent.SEGMENTS.APP) {
      return new StoreClass(data, pkg)
    } else {
      return new StoreClass(data)
    }
  }

  /* **************************************************************************/
  // Changing
  /* **************************************************************************/

  /**
  * Updates a segment
  * @param segment: the name of the segment to update
  * @param updates: k-> of update to apply
  */
  handleUpdate ({ segment, updates }) {
    const js = this[segment].changeData(updates)
    persistence.setJSONItem(segment, js)
    this[segment] = this.createStore(segment, js)
  }

  /**
  * Toggles a bool
  * @param segment: the name of the segment
  * @param key: the name of the key to toggle
  */
  handleToggleBool ({ segment, key }) {
    const js = this[segment].cloneData()
    js[key] = !this[segment][key]
    persistence.setJSONItem(segment, js)
    this[segment] = this.createStore(segment, js)
  }

  /* **************************************************************************/
  // Changing : Special cases
  /* **************************************************************************/

  handleSetHasSeenAppWizard ({ hasSeen }) {
    this.preventDefault()
    actions.update.defer(SettingsIdent.SEGMENTS.APP, 'hasSeenAppWizard', hasSeen)
    if (this.isTourActive()) {
      actions.tourNext.defer()
    }
  }

  /* **************************************************************************/
  // Changing : Spellchecker
  /* **************************************************************************/

  handleSetSpellcheckerLanguage ({ lang }) {
    const primaryInfo = dictionaries[lang]
    const secondaryInfo = (dictionaries[this.language.secondarySpellcheckerLanguage] || {})

    if (primaryInfo.charset !== secondaryInfo.charset) {
      this.handleUpdate({
        segment: SettingsIdent.SEGMENTS.LANGUAGE,
        updates: {
          spellcheckerLanguage: lang,
          secondarySpellcheckerLanguage: null
        }
      })
    } else {
      this.handleUpdate({
        segment: SettingsIdent.SEGMENTS.LANGUAGE,
        updates: { spellcheckerLanguage: lang }
      })
    }
  }

  handleSetSecondarySpellcheckerLanguage ({ lang }) {
    if (!lang) {
      this.handleUpdate({
        segment: SettingsIdent.SEGMENTS.LANGUAGE,
        updates: { secondarySpellcheckerLanguage: null }
      })
    } else {
      const primaryInfo = (dictionaries[this.language.spellcheckerLanguage] || {})
      const secondaryInfo = (dictionaries[lang] || {})
      if (primaryInfo.charset === secondaryInfo.charset) {
        this.handleUpdate({
          segment: SettingsIdent.SEGMENTS.LANGUAGE,
          updates: { secondarySpellcheckerLanguage: lang }
        })
      }
    }
  }
}

export default alt.createStore(SettingsStore, 'SettingsStore')
