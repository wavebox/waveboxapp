import CrashReporter from './CrashReporter'

const privWatching = Symbol('privWatching')
const privCrashReporter = Symbol('privCrashReporter')
const privAnalyticsEnabled = Symbol('privAnalyticsEnabled')

class CrashReporterWatcher {
  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  static get RUNTIME_IDENTIFIERS () { return CrashReporter.RUNTIME_IDENTIFIERS }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privWatching] = false
    this[privCrashReporter] = undefined
    this[privAnalyticsEnabled] = false
  }

  /* ****************************************************************************/
  // Watch
  /* ****************************************************************************/

  /**
  * Starts the watcher
  * @param userStore: the user store
  * @param settingsStore: the settings store
  * @param runtimeIdentifier: the runtime identifier
  * @param osRelease=undefined: the os release version
  */
  start (userStore, settingsStore, runtimeIdentifier, osRelease = undefined) {
    if (this[privWatching]) {
      throw new Error('Unable to start CrashReporterWatcher - already running')
    }

    const userState = userStore.getState()
    const settingsState = settingsStore.getState()
    this[privCrashReporter] = new CrashReporter(runtimeIdentifier, osRelease)
    this[privCrashReporter].addClientId(userState.clientId)
    this[privCrashReporter].addAppSettings(settingsState.launched.app)

    this._userStoreChanged(userState)
    userStore.listen(this._userStoreChanged)
    this[privWatching] = true
  }

  /* ****************************************************************************/
  // Listeners
  /* ****************************************************************************/

  _userStoreChanged = (userState) => {
    /**
    * There is an issue here in renderers in that if the crash reporter is enabled late
    * the crash reports don't always go out. If the reporter is enabled on launch then
    * it seems to be okay.
    * This isn't exhibited on the browser thread.
    */
    if (!this[privCrashReporter]) { return }
    if (this[privAnalyticsEnabled] === false && userState.user.analyticsEnabled === true) {
      this[privAnalyticsEnabled] = true
      this[privCrashReporter].startCrashReporter()
    }
  }
}

export default CrashReporterWatcher
