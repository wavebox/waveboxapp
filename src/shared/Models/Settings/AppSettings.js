const Model = require('../Model')
const { RELEASE_CHANNELS } = require('../../constants')

class AppSettings extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get UPDATE_CHANNELS () { return RELEASE_CHANNELS }
  static get SUPPORTS_MIXED_SANDBOX_MODE () { return true }

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
  get hasSetUpdateChannel () { return this._value_('updateChannel', undefined) !== undefined }
  get hasSeenAppWizard () { return this._value_('hasSeenAppWizard', false) }
  get hasSeenOptimizeWizard () { return this._value_('hasSeenOptimizeWizard', false) }
  get hasSeenAppTour () { return this._value_('hasSeenAppTour', false) }
  get lastSeenAccountMessageUrl () { return this._value_('lastSeenAccountMessageUrl', undefined) }
  get hasSeenSnapSetupMessage () { return this._value_('hasSeenSnapSetupMessage', false) }
  get hasSeenLinuxSetupMessage () { return this._value_('hasSeenLinuxSetupMessage', false) }
  get writeMetricsLog () { return this._value_('writeMetricsLog', false) }
  get enableAutofillService () { return this._value_('enableAutofillService', true) }
  get isolateMailboxProcesses () { return this._value_('isolateMailboxProcesses', false) }
  get enableMixedSandboxMode () { return this._value_('enableMixedSandboxMode', true) }
  get enableWindowOpeningEngine () { return this._value_('enableWindowOpeningEngine', true) }
  get enableMouseNavigationDarwin () { return this._value_('enableMouseNavigationDarwin', true) }
}

module.exports = AppSettings
