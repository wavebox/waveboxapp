const Model = require('../Model')

class AppSettings extends Model {
  get ignoreGPUBlacklist () { return this._value_('ignoreGPUBlacklist', true) }
  get disableSmoothScrolling () { return this._value_('disableSmoothScrolling', false) }
  get enableUseZoomForDSF () { return this._value_('enableUseZoomForDSF', true) }
  get checkForUpdates () { return this._value_('checkForUpdates', true) }
  get hasSeenAppWizard () { return this._value_('hasSeenAppWizard', false) }
  get hasAgreedToEULA () { return this._value_('hasAgreedToEULA', false) }
  get lastSeenAccountMessageUrl () { return this._value_('lastSeenAccountMessageUrl', undefined) }
}

module.exports = AppSettings
