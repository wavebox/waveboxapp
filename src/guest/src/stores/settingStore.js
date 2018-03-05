import LiveConfig from 'LiveConfig'
import pkg from 'package.json'
import {
  AcceleratorSettings,
  AppSettings,
  ExtensionSettings,
  LanguageSettings,
  NewsSettings,
  OSSettings,
  TraySettings,
  UISettings
} from 'shared/Models/Settings'

class SettingStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    const data = LiveConfig.launchSettings
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

export default new SettingStore()
