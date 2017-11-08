const req = require('./req')
const { RENDER_PROCESS_PREFERENCE_TYPES } = req.shared('processPreferences')
const pkg = req.package()
const {
  AcceleratorSettings,
  AppSettings,
  ExtensionSettings,
  LanguageSettings,
  NewsSettings,
  OSSettings,
  TraySettings,
  UISettings
} = req.shared('Models/Settings')

class SettingStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this._loadData(this._getFromProcess() || {})
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Gets the setting data from the process
  * @return the data or undefined
  */
  _getFromProcess () {
    const preferences = process.getRenderProcessPreferences()
    if (preferences) {
      for (const pref of preferences) {
        if (pref.type === RENDER_PROCESS_PREFERENCE_TYPES.WB_LAUNCH_SETTINGS) {
          return pref
        }
      }
    }
    return undefined
  }

  /**
  * Loads the models from the given pref
  * @param data: the data to load from
  */
  _loadData (data) {
    this.accelerators = new AcceleratorSettings(data.accelerators || {})
    this.app = new AppSettings(data.app || {}, pkg)
    this.extension = new ExtensionSettings(data.extension || {})
    this.language = new LanguageSettings(data.language || {})
    this.news = new NewsSettings(data.news || {})
    this.os = new OSSettings(data.os || {})
    this.tray = new TraySettings(data.tray || {})
    this.ui = new UISettings(data.ui || {})
  }
}

module.exports = new SettingStore()
