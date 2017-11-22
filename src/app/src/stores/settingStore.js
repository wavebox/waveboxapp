import persistence from 'storage/settingStorage'
import { EventEmitter } from 'events'
import pkg from 'package.json'
import {
  SettingsIdent,
  AcceleratorSettings,
  AppSettings,
  ExtensionSettings,
  LanguageSettings,
  NewsSettings,
  OSSettings,
  TraySettings,
  UISettings
} from 'shared/Models/Settings'
import { RENDER_PROCESS_PREFERENCE_TYPES } from 'shared/processPreferences'
import { renderProcessPreferences } from 'R/atomProcess'
const { SEGMENTS } = SettingsIdent

class SettingStore extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()
    this._renderProcEntry = undefined

    // Build the current data
    this.accelerators = new AcceleratorSettings(persistence.getJSONItem(SEGMENTS.ACCELERATORS, {}))
    this.app = new AppSettings(persistence.getJSONItem(SEGMENTS.APP, {}), pkg)
    this.extension = new ExtensionSettings(persistence.getJSONItem(SEGMENTS.EXTENSION, {}))
    this.language = new LanguageSettings(persistence.getJSONItem(SEGMENTS.LANGUAGE, {}))
    this.news = new NewsSettings(persistence.getJSONItem(SEGMENTS.NEWS, {}))
    this.os = new OSSettings(persistence.getJSONItem(SEGMENTS.OS, {}))
    this.tray = new TraySettings(persistence.getJSONItem(SEGMENTS.TRAY, {}))
    this.ui = new UISettings(persistence.getJSONItem(SEGMENTS.UI, {}))

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

    // Listen for changes
    persistence.on('changed:' + SEGMENTS.ACCELERATORS, () => {
      const prev = this.accelerators
      this.accelerators = new AcceleratorSettings(persistence.getJSONItem(SEGMENTS.ACCELERATORS, {}))
      this.emit('changed', { })
      this.emit('changed:' + SEGMENTS.ACCELERATORS, { prev: prev, next: this.accelerators })
    })
    persistence.on('changed:' + SEGMENTS.APP, () => {
      const prev = this.language
      this.app = new AppSettings(persistence.getJSONItem(SEGMENTS.APP, {}), pkg)
      this.emit('changed', { })
      this.emit('changed:' + SEGMENTS.APP, { prev: prev, next: this.app })
    })
    persistence.on('changed:' + SEGMENTS.EXTENSION, () => {
      const prev = this.language
      this.extension = new ExtensionSettings(persistence.getJSONItem(SEGMENTS.EXTENSION, {}), pkg)
      this.emit('changed', { })
      this.emit('changed:' + SEGMENTS.EXTENSION, { prev: prev, next: this.extension })
    })
    persistence.on('changed:' + SEGMENTS.LANGUAGE, () => {
      const prev = this.language
      this.language = new LanguageSettings(persistence.getJSONItem(SEGMENTS.LANGUAGE, {}))
      this.emit('changed', { })
      this.emit('changed:' + SEGMENTS.LANGUAGE, { prev: prev, next: this.language })
    })
    persistence.on('changed:' + SEGMENTS.NEWS, () => {
      const prev = this.news
      this.news = new NewsSettings(persistence.getJSONItem(SEGMENTS.NEWS, {}))
      this.emit('changed', { })
      this.emit('changed:' + SEGMENTS.NEWS, { prev: prev, next: this.news })
    })
    persistence.on('changed:' + SEGMENTS.OS, () => {
      const prev = this.os
      this.os = new OSSettings(persistence.getJSONItem(SEGMENTS.OS, {}))
      this.emit('changed', { })
      this.emit('changed:' + SEGMENTS.OS, { prev: prev, next: this.os })
    })
    persistence.on('changed:' + SEGMENTS.TRAY, () => {
      const prev = this.tray
      this.tray = new TraySettings(persistence.getJSONItem(SEGMENTS.TRAY, {}))
      this.emit('changed', { })
      this.emit('changed:' + SEGMENTS.TRAY, { prev: prev, next: this.tray })
    })
    persistence.on('changed:' + SEGMENTS.UI, () => {
      const prev = this.ui
      this.ui = new UISettings(persistence.getJSONItem(SEGMENTS.UI, {}))
      this.emit('changed', { })
      this.emit('changed:' + SEGMENTS.UI, { prev: prev, next: this.ui })
    })
  }

  checkAwake () { return true }

  /* ****************************************************************************/
  // Calls
  /* ****************************************************************************/

  /**
  * Writes the launch settings to the render process if it hasn't been written before
  * @return true if written, false otherwise
  */
  writeLaunchSettingsToRenderProcess () {
    if (this._renderProcEntry) { return false }

    this._renderProcEntry = renderProcessPreferences.addEntry({
      ...Object.keys(this.launched).reduce((acc, segment) => {
        acc[segment] = this.launched[segment].cloneData()
        return acc
      }, {}),
      type: RENDER_PROCESS_PREFERENCE_TYPES.WB_LAUNCH_SETTINGS
    })

    return true
  }
}

export default new SettingStore()
