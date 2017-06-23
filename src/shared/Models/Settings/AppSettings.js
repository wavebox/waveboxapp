const Model = require('../Model')

const UPDATE_CHANNELS = Object.assign({
  STABLE: 'STABLE',
  BETA: 'BETA'
})

class AppSettings extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get UPDATE_CHANNELS () { return UPDATE_CHANNELS }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get ignoreGPUBlacklist () { return this._value_('ignoreGPUBlacklist', true) }
  get disableSmoothScrolling () { return this._value_('disableSmoothScrolling', false) }
  get enableUseZoomForDSF () { return this._value_('enableUseZoomForDSF', true) }
  get checkForUpdates () { return this._value_('checkForUpdates', true) }
  get updateChannel () { return this._value_('updateChannel', UPDATE_CHANNELS.STABLE) }
  get hasSeenAppWizard () { return this._value_('hasSeenAppWizard', false) }
  get hasAgreedToEULA () { return this._value_('hasAgreedToEULA', false) }
  get lastSeenAccountMessageUrl () { return this._value_('lastSeenAccountMessageUrl', undefined) }

  get useExperimentalWindowOpener () { return this._value_('3_1_8_useExperimentalWindowOpener', false) }
}

module.exports = AppSettings
