import alt from '../alt'
import actions from './settingsActions'
import persistence from './settingsPersistence'
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
import pkg from 'package.json'

class SettingsStore {
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

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleLoad: actions.LOAD
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad () {
    // Load everything
    this.accelerators = new AcceleratorSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.ACCELERATORS, {}))
    this.app = new AppSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.APP, {}), pkg)
    this.extension = new ExtensionSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.EXTENSION, {}))
    this.language = new LanguageSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.LANGUAGE, {}))
    this.news = new NewsSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.NEWS, {}))
    this.os = new OSSettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.OS, {}))
    this.tray = new TraySettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.TRAY, {}), {})
    this.ui = new UISettings(persistence.getJSONItemSync(SettingsIdent.SEGMENTS.UI, {}))
  }
}

export default alt.createStore(SettingsStore, 'SettingsStore')
