const persistence = require('../storage/settingStorage')
const { EventEmitter } = require('events')
const pkg = require('../../package.json')
const {
  Settings: {
    SettingsIdent: { SEGMENTS },

    AcceleratorSettings,
    AppSettings,
    LanguageSettings,
    OSSettings,
    TraySettings,
    UISettings
  }
} = require('../../shared/Models')

class SettingStore extends EventEmitter {
  constructor () {
    super()

    // Build the current data
    this.accelerators = new AcceleratorSettings(persistence.getJSONItem(SEGMENTS.ACCELERATORS, {}))
    this.app = new AppSettings(persistence.getJSONItem(SEGMENTS.APP, {}), pkg)
    this.language = new LanguageSettings(persistence.getJSONItem(SEGMENTS.LANGUAGE, {}))
    this.os = new OSSettings(persistence.getJSONItem(SEGMENTS.OS, {}))
    this.tray = new TraySettings(persistence.getJSONItem(SEGMENTS.TRAY, {}))
    this.ui = new UISettings(persistence.getJSONItem(SEGMENTS.UI, {}))

    this.launched = {
      accelerators: this.accelerators,
      app: this.app,
      language: this.language,
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
    persistence.on('changed:' + SEGMENTS.LANGUAGE, () => {
      const prev = this.language
      this.language = new LanguageSettings(persistence.getJSONItem(SEGMENTS.LANGUAGE, {}))
      this.emit('changed', { })
      this.emit('changed:' + SEGMENTS.LANGUAGE, { prev: prev, next: this.language })
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
}

module.exports = new SettingStore()
