import credentials from 'shared/credentials'
import { CRASH_REPORT_SERVER } from 'shared/constants'
import userStore from 'stores/userStore'
import settingStore from 'stores/settingStore'
import electron from 'electron'
import pkg from 'package.json'
import LiveConfig from './LiveConfig'

const privStarted = Symbol('privStarted')

class CrashReporter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privStarted] = false
  }

  start () {
    if (this[privStarted]) { return }
    this[privStarted] = true

    if (!credentials.CRASH_REPORTING) { return }
    if (!userStore.analyticsEnabled) { return }

    const payload = {
      runtimeIdentifier: 'GUEST',
      initTime: new Date().getTime(),
      version: pkg.version,
      channel: pkg.releaseChannel,
      platform: LiveConfig.platform,
      arch: LiveConfig.arch,
      release: LiveConfig.osRelease,
      clientId: userStore.clientId,
      ignoreGPUBlacklist: settingStore.app.ignoreGPUBlacklist,
      disableHardwareAcceleration: settingStore.app.disableHardwareAcceleration,
      isolateMailboxProcesses: settingStore.app.isolateMailboxProcesses,
      enableMixedSandboxMode: settingStore.app.enableMixedSandboxMode,
      vibrancyMode: settingStore.ui.vibrancyMode
    }

    electron.crashReporter.start({
      productName: 'Wavebox',
      companyName: 'Wavebox',
      submitURL: `${CRASH_REPORT_SERVER}/app/crash/hard`,
      extra: Object.keys(payload).reduce((acc, k) => {
        acc[k] = `${payload[k]}`
        return acc
      }, {})
    })
  }
}

export default CrashReporter
