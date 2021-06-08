import electron from 'electron'
import pkg from 'package.json'
import credentials from '../credentials'
import { CRASH_REPORT_SERVER } from '../constants'

const privPayload = Symbol('privPayload')
const privReporterStarted = Symbol('privReporterStarted')

const RUNTIME_IDENTIFIERS = Object.freeze({
  MAIN: 'MAIN',
  MAILBOXES: 'MAILBOXES',
  TRAY: 'TRAY'
})

class CrashReporter {
  /* ****************************************************************************/
  // Factory
  /* ****************************************************************************/

  /**
  * Creates a crash reporter and binds to everything, respecting user settings
  * @param userState: the current user state
  * @param settingsState: the current settings state
  * @param runtimeIdentifier: the runtime identifier
  * @param osRelease=undefined: the os release (if available)
  * @return an instance of the crash reporter or undefiend if disallowed by the user
  */
  static createCrashReporter (userState, settingsState, runtimeIdentifier, osRelease = undefined) {
    if (userState.user.analyticsEnabled) {
      const reporter = new CrashReporter(runtimeIdentifier, osRelease)
      reporter.addClientId(userState.clientId)
      reporter.addAppSettings(settingsState.launched.app, settingsState.launched.ui)
      reporter.startCrashReporter()
      return reporter
    } else {
      return undefined
    }
  }

  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  static get RUNTIME_IDENTIFIERS () { return RUNTIME_IDENTIFIERS }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param runtimeIdentifier: an identifier to be sent for the current runtime
  * @param osRelease=undefined: the os release info
  */
  constructor (runtimeIdentifier, osRelease = undefined) {
    this[privReporterStarted] = false
    this[privPayload] = {
      runtimeIdentifier: runtimeIdentifier,
      initTime: new Date().getTime(),
      version: pkg.version,
      channel: pkg.releaseChannel,
      platform: process.platform,
      arch: process.arch,
      release: osRelease
    }
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isAppEnabled () { return credentials.CRASH_REPORTING === true }

  /* ****************************************************************************/
  // Configure
  /* ****************************************************************************/

  /**
  * Adds the client id
  * @param clientId: the new client id
  */
  addClientId (clientId) {
    this[privPayload].clientId = clientId

    if (!this.isAppEnabled) { return }

    if (this[privReporterStarted]) {
      if (process.platform === 'darwin') {
        electron.crashReporter.addExtraParameter('clientId', `${clientId}`)
      } else {
        electron.crashReporter.start(this._buildCrashReporterConfig())
      }
    }
  }

  /**
  * Adds the app settings
  * @param appSettings: the app settings to add
  * @param uiSettings: the ui settings to add
  */
  addAppSettings (appSettings, uiSettings) {
    this[privPayload].ignoreGPUBlacklist = appSettings.ignoreGPUBlacklist
    this[privPayload].disableHardwareAcceleration = appSettings.disableHardwareAcceleration
    this[privPayload].isolateMailboxProcesses = appSettings.isolateMailboxProcesses
    this[privPayload].enableMixedSandboxMode = appSettings.enableMixedSandboxMode
    this[privPayload].vibrancyMode = uiSettings.vibrancyMode

    if (!this.isAppEnabled) { return }

    if (this[privReporterStarted]) {
      if (process.platform === 'darwin') {
        electron.crashReporter.addExtraParameter('ignoreGPUBlacklist', `${appSettings.ignoreGPUBlacklist}`)
        electron.crashReporter.addExtraParameter('disableHardwareAcceleration', `${appSettings.disableHardwareAcceleration}`)
        electron.crashReporter.addExtraParameter('isolateMailboxProcesses', `${appSettings.isolateMailboxProcesses}`)
        electron.crashReporter.addExtraParameter('enableMixedSandboxMode', `${appSettings.enableMixedSandboxMode}`)
        electron.crashReporter.addExtraParameter('vibrancyMode', `${uiSettings.vibrancyMode}`)
      } else {
        electron.crashReporter.start(this._buildCrashReporterConfig())
      }
    }
  }

  /* ****************************************************************************/
  // Crash reporter
  /* ****************************************************************************/

  /**
  * Starts the hard crash reporter
  */
  startCrashReporter () {
    if (!this.isAppEnabled) { return }
    if (this[privReporterStarted]) { return }

    electron.crashReporter.start(this._buildCrashReporterConfig())
    this[privReporterStarted] = true
  }

  /**
  * Builds the crash reporter config for the current state
  * @return config for crash reporter
  */
  _buildCrashReporterConfig () {
    return {
      productName: `${pkg.name[0].toUpperCase()}${pkg.name.substr(1)}`,
      companyName: `${pkg.name[0].toUpperCase()}${pkg.name.substr(1)}`,
      submitURL: `${CRASH_REPORT_SERVER}/app/crash/hard`,
      extra: Object.keys(this[privPayload]).reduce((acc, k) => {
        acc[k] = `${this[privPayload][k]}`
        return acc
      }, {})
    }
  }
}

export default CrashReporter
