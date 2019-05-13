import { SettingsIdent } from '../../../Models/Settings'
import CoreSettingsActions from './CoreSettingsActions'
import {
  WB_METRICS_OPEN_MONITOR,
  WB_METRICS_OPEN_LOG
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

class AppSettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param actions: the actions instance to use
  */
  constructor (actions) {
    super(SettingsIdent.SEGMENTS.APP, actions)
  }

  /* **************************************************************************/
  // Dispatch
  /* **************************************************************************/

  /**
  * @param ignore: true to ignore the gpu blacklist
  */
  ignoreGPUBlacklist (ignore) {
    this.dispatchUpdate('ignoreGPUBlacklist', ignore)
  }

  /**
  * @param enable: true to enable using zoom for dsf
  */
  enableUseZoomForDSF (enable) {
    this.dispatchUpdate('enableUseZoomForDSF', enable)
  }

  /**
  * @param disable: true to disable smooth scrolling
  */
  disableSmoothScrolling (disable) {
    this.dispatchUpdate('disableSmoothScrolling', disable)
  }

  /**
  * @param disable: true to disable hardware acceleration
  */
  disableHardwareAcceleration (disable) {
    this.dispatchUpdate('disableHardwareAcceleration', disable)
  }

  /**
  * @param toggled: true to check for updates
  */
  checkForUpdates (toggled) {
    this.dispatchUpdate('checkForUpdates', toggled)
  }

  /**
  * @param channel: the new update channel
  */
  setUpdateChannel (channel) {
    this.dispatchUpdate('updateChannel', channel)
  }

  /**
  * Takes the current channel of the app and glues it to the user update channel
  */
  glueCurrentUpdateChannel () {
    this.actions.glueCurrentUpdateChannel()
  }

  /**
  * @param hasSeen: true if the user has seen the app tour
  */
  setHasSeenTour (hasSeen) {
    this.dispatchUpdate('hasSeenAppTour', hasSeen)
  }

  /**
  * @param hasSeen: true if the user has seen the app wizard
  */
  setHasSeenAppWizard (hasSeen) {
    this.dispatchUpdate('hasSeenAppWizard', hasSeen)
  }

  /**
  * @param hasSeen: true if the user has seen the optimize wizard
  */
  setHasSeenOptimizeWizard (hasSeen) {
    this.dispatchUpdate('hasSeenOptimizeWizard', hasSeen)
  }

  /**
  * Sets that an account message url has been seen
  * @param url: the url to set as seen
  */
  setSeenAccountMessageUrl (url) {
    this.dispatchUpdate('lastSeenAccountMessageUrl', url)
  }

  /**
  * Sets whether the user has seen the snap update message
  * @param seen: true if seen
  */
  setHasSeenSnapSetupMessage (seen) {
    this.dispatchUpdate('hasSeenSnapSetupMessage', seen)
  }

  /**
  * Sets whether the user has seen the linux setup message
  * @param seen: true if seen
  */
  setHasSeenLinuxSetupMessage (seen) {
    this.dispatchUpdate('hasSeenLinuxSetupMessage', seen)
  }

  /**
  * Sets whether the metrics log should be written
  * @param write: true to write the log
  */
  setWriteMetricsLog (write) {
    this.dispatchUpdate('writeMetricsLog', write)
  }

  /**
  * Sets whether autofill is enabled
  * @param enabled: true to enable, false to disable
  */
  setEnableAutofillServie (enabled) {
    this.dispatchUpdate('enableAutofillService', enabled)
  }

  /**
  * Sets whether mailbox processes should be isolated from each other
  * @param isolate: true to isolate, false to not
  */
  setIsolateMailboxProcesses (isolate) {
    this.dispatchUpdate('isolateMailboxProcesses', isolate)
  }

  /**
  * Enables or disables mixed sandbox mode
  * @param enable: true to enable, false to not
  */
  setEnableMixedSandboxMode (enable) {
    this.dispatchUpdate('enableMixedSandboxMode', enable)
  }

  /**
  * Sets whether the window opening engine should be enabled or not
  * @param enable: true to enable
  */
  setEnableWindowOpeningEngine (enable) {
    this.dispatchUpdate('enableWindowOpeningEngine', enable)
  }

  /**
  * Sets whether to polyfill useragents or not
  * @param enable: true to enable
  */
  setPolyfillUserAgents (enable) {
    this.dispatchUpdate('polyfillUserAgents', enable)
  }

  /**
  * Sets the concurrent load limit for services
  * @param limit: the new limit. 0 for auto. Infinity for no limit
  */
  setConcurrentServiceLoadLimit (limit) {
    limit = parseInt(limit)
    if (isNaN(limit)) { limit = 0 }
    if (limit < -1) { limit = 0 }
    if (limit > 20) { limit = 20 }
    this.dispatchUpdate('concurrentServiceLoadLimit', limit)
  }

  /**
  * Sets whether to fetch microsoft calls on the main thread
  * @param use: true to use
  */
  setAppThreadFetchMicrosoftHTTP (use) {
    this.dispatchUpdate('appThreadFetchMicrosoftHTTP', use)
  }

  /**
  * Sets whether to force a repaint on window restore
  * @param force: true to force
  */
  setForceWindowPaintOnRestore (force) {
    this.dispatchUpdate('forceWindowPaintOnRestore', force)
  }

  /**
  * @param show: true to show the persist cookies option for accounts
  */
  setShowArtificiallyPersistCookies (show) {
    this.dispatchUpdate('showArtificiallyPersistCookies', show)
  }

  /**
  * @param enabled: true if we should enable support
  */
  setTouchBarSupportEnabled (enabled) {
    this.dispatchUpdate('touchBarSupportEnabled', enabled)
  }

  /**
  * Sets the search provider
  * @param provider: the new search provider
  */
  setSearchProvider (provider) {
    this.dispatchUpdate('searchProvider', provider)
  }

  /**
  * Sets the proxy mode
  * @param mode: the new mode
  */
  setProxyMode (mode) {
    this.dispatchUpdate('proxyMode', mode)
  }

  /**
  * Sets the proxy server
  * @param server: the new server
  */
  setProxyServer (server) {
    this.dispatchUpdate('proxyServer', server)
  }

  /**
  * Sets the proxy port
  * @param port: the new port
  */
  setProxyPort (port) {
    this.dispatchUpdate('proxyPort', port)
  }

  /**
  * Opens the metrics log
  */
  openMetricsLog () {
    if (process.type !== 'renderer') {
      throw new Error('"openMetricsLog" is only available in the renderer process')
    }
    ipcRenderer.send(WB_METRICS_OPEN_LOG, {})
  }

  /**
  * Opens the metrics monitor window
  */
  openMetricsMonitor () {
    if (process.type !== 'renderer') {
      throw new Error('"openMetricsMonitor" is only available in the renderer process')
    }
    ipcRenderer.send(WB_METRICS_OPEN_MONITOR, {})
  }
}

export default AppSettingsActions
