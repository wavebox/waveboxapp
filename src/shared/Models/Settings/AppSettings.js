const Model = require('../Model')
const { RELEASE_CHANNELS } = require('../../constants')

class AppSettings extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get UPDATE_CHANNELS () { return RELEASE_CHANNELS }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param data: the user data
  * @param pkg: the current package
  */
  constructor (data, pkg) {
    super(data)
    this.__defaults__ = {
      '3_1_8_useExperimentalWindowOpener': pkg.releaseChannel === RELEASE_CHANNELS.BETA,
      updateChannel: pkg.releaseChannel
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get ignoreGPUBlacklist () { return this._value_('ignoreGPUBlacklist', true) }
  get disableSmoothScrolling () { return this._value_('disableSmoothScrolling', false) }
  get enableUseZoomForDSF () { return this._value_('enableUseZoomForDSF', true) }
  get disableHardwareAcceleration () { return this._value_('disableHardwareAcceleration', false) }
  get checkForUpdates () { return this._value_('checkForUpdates', true) }
  get updateChannel () { return this._value_('updateChannel', this.__defaults__.updateChannel) }
  get hasSeenAppWizard () { return this._value_('hasSeenAppWizard', false) }
  get hasAgreedToEULA () { return this._value_('hasAgreedToEULA', false) }
  get lastSeenAccountMessageUrl () { return this._value_('lastSeenAccountMessageUrl', undefined) }

  get useExperimentalWindowOpener () { return this._value_('3_1_8_useExperimentalWindowOpener', this.__defaults__['3_1_8_useExperimentalWindowOpener']) }
}

module.exports = AppSettings
