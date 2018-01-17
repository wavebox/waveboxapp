const SettingsIdent = require('./SettingsIdent')
const AcceleratorSettings = require('./AcceleratorSettings')
const AppSettings = require('./AppSettings')
const ExtensionSettings = require('./ExtensionSettings')
const LanguageSettings = require('./LanguageSettings')
const NewsSettings = require('./NewsSettings')
const OSSettings = require('./OSSettings')
const TraySettings = require('./TraySettings')
const UISettings = require('./UISettings')

class SettingsFactory {
  /**
  * Gets the class for the relevant mailbox model
  * @param ident: the identifier of the segment
  * @return the correct class or undefined
  */
  static getClass (ident) {
    switch (ident) {
      case SettingsIdent.SEGMENTS.ACCELERATORS: return AcceleratorSettings
      case SettingsIdent.SEGMENTS.APP: return AppSettings
      case SettingsIdent.SEGMENTS.EXTENSION: return ExtensionSettings
      case SettingsIdent.SEGMENTS.LANGUAGE: return LanguageSettings
      case SettingsIdent.SEGMENTS.NEWS: return NewsSettings
      case SettingsIdent.SEGMENTS.OS: return OSSettings
      case SettingsIdent.SEGMENTS.TRAY: return TraySettings
      case SettingsIdent.SEGMENTS.UI: return UISettings
    }
  }

  /**
  * Converts plain data into the relevant mailbox model
  * @param ident: the identifier for the segment
  * @param data: the data for the object
  * @return the settings or undefined
  */
  static modelize (ident, ...data) {
    const ModelClass = this.getClass(ident)
    if (ModelClass) {
      return new ModelClass(...data)
    } else {
      return undefined
    }
  }
}

module.exports = SettingsFactory
