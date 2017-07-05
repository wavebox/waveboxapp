import alt from '../alt'
import actions from './settingsActions'
import persistence from './settingsPersistence'
import dictionaries from 'shared/dictionaries.js'
import fs from 'fs'
import {
  AcceleratorSettings,
  AppSettings,
  LanguageSettings,
  OSSettings,
  TraySettings,
  UISettings,
  SettingsIdent
} from 'shared/Models/Settings'
const homeDir = window.appNodeModulesRequire('home-dir') // pull this from main thread
const { systemPreferences } = window.nativeRequire('electron').remote

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
    this.language = null
    this.os = null
    this.tray = null
    this.ui = null

    this.launched = {
      accelerators: null,
      app: null,
      language: null,
      os: null,
      tray: null,
      ui: null
    }

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
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleLoad: actions.LOAD,
      handleUpdate: actions.UPDATE,
      handleToggleBool: actions.TOGGLE,

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
    this.app = new AppSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.APP, {}))
    this.language = new LanguageSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.LANGUAGE, {}))
    this.os = new OSSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.OS, {}))
    this.tray = new TraySettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.TRAY, {}), this.trayDefaults)
    this.ui = new UISettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.UI, {}))

    this.launched = {
      accelerators: this.accelerators,
      app: this.app,
      language: this.language,
      os: this.os,
      tray: this.tray,
      ui: this.ui
    }
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
      case SettingsIdent.SEGMENTS.LANGUAGE: return LanguageSettings
      case SettingsIdent.SEGMENTS.OS: return OSSettings
      case SettingsIdent.SEGMENTS.TRAY: return TraySettings
      case SettingsIdent.SEGMENTS.UI: return UISettings
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
    const StoreClass = this.storeClassFromSegment(segment)

    const js = this[segment].changeData(updates)
    persistence.setJSONItem(segment, js)
    if (segment === SettingsIdent.SEGMENTS.TRAY) {
      this[segment] = new StoreClass(js, this.trayDefaults)
    } else {
      this[segment] = new StoreClass(js)
    }
  }

  /**
  * Toggles a bool
  * @param segment: the name of the segment
  * @param key: the name of the key to toggle
  */
  handleToggleBool ({ segment, key }) {
    const StoreClass = this.storeClassFromSegment(segment)

    const js = this[segment].cloneData()
    js[key] = !this[segment][key]
    persistence.setJSONItem(segment, js)
    if (segment === SettingsIdent.SEGMENTS.TRAY) {
      this[segment] = new StoreClass(js, this.trayDefaults)
    } else {
      this[segment] = new StoreClass(js)
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
