import alt from '../alt'
import actions from './updaterActions'
import settingsStore from '../settings/settingsStore'
import querystring from 'querystring'
import {
  UPDATE_CHECK_INTERVAL,
  UPDATE_FEED_MANUAL,
  UPDATE_FEED_DARWIN,
  UPDATE_FEED_WIN32_IA32,
  UPDATE_FEED_WIN32_X64,
  UPDATE_USER_MANUAL_DOWNLOAD_STABLE,
  UPDATE_USER_MANUAL_DOWNLOAD_BETA,
  UPDATE_USER_CHANGELOG_STABLE,
  UPDATE_USER_CHANGELOG_BETA
} from 'shared/constants'
import {
  WB_SQUIRREL_UPDATE_CHECK,
  WB_SQUIRREL_APPLY_UPDATE
} from 'shared/ipcEvents'
import WBRPCRenderer from 'shared/WBRPCRenderer'
import Platform from 'shared/Platform'
import AppSettings from 'shared/Models/Settings/AppSettings'
import { ipcRenderer } from 'electron'
import pkg from 'package.json'
import DistributionConfig from 'Runtime/DistributionConfig'

const UPDATE_STATES = Object.freeze({
  CHECKING: 'CHECKING',
  DOWNLOADING: 'DOWNLOADING',
  DOWNLOADED: 'DOWNLOADED',
  NONE: 'NONE',
  ERROR: 'ERROR'
})

class UpdaterStore {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get UPDATE_STATES () { return UPDATE_STATES }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.squirrelEnabled = Platform.SQUIRREL_UPDATE_ENABLED_ON_PLATFORM
    this.osPackageManager = Platform.PACKAGE_MANAGERS.UNKNOWN
    this.nextCheckTO = null
    this.lastManualDownloadUrl = null
    this.updateFailedCount = 0
    this.updateState = UPDATE_STATES.NONE
    this.userActionedUpdate = false

    /* **************************************/
    // Update state
    /* **************************************/

    this.isWorking = () => this.updateState === UPDATE_STATES.CHECKING || this.updateState === UPDATE_STATES.DOWNLOADING
    this.isCheckingUpdate = () => this.updateState === UPDATE_STATES.CHECKING
    this.isDownloadingUpdate = () => this.updateState === UPDATE_STATES.DOWNLOADING
    this.isDownloadedUpdate = () => this.updateState === UPDATE_STATES.DOWNLOADED
    this.isNoUpdate = () => this.updateState === UPDATE_STATES.NONE
    this.isErrorUpdate = () => this.updateState === UPDATE_STATES.ERROR

    /* **************************************/
    // Urls
    /* **************************************/

    this.getManualUpdateDownloadUrl = () => {
      const updateChannel = settingsStore.getState().app.updateChannel
      if (updateChannel === AppSettings.UPDATE_CHANNELS.BETA) {
        return UPDATE_USER_MANUAL_DOWNLOAD_BETA
      } else {
        return UPDATE_USER_MANUAL_DOWNLOAD_STABLE
      }
    }

    this.getChangelogUrl = () => {
      const updateChannel = settingsStore.getState().app.updateChannel
      if (updateChannel === AppSettings.UPDATE_CHANNELS.BETA) {
        return UPDATE_USER_CHANGELOG_BETA
      } else {
        return UPDATE_USER_CHANGELOG_STABLE
      }
    }

    /* **************************************/
    // Listeners
    /* **************************************/

    this.bindListeners({
      handleLoad: actions.LOAD,
      handleUnload: actions.UNLOAD,

      // Squirrel
      handleSquirrelUpdateCheckStart: actions.SQUIRREL_UPDATE_CHECK_START,
      handleSquirrelUpdateAvailable: actions.SQUIRREL_UPDATE_AVAILABLE,
      handleSquirrelUpdateNotAvailable: actions.SQUIRREL_UPDATE_NOT_AVAILABLE,
      handleSquirrelUpdateDownloaded: actions.SQUIRREL_UPDATE_DOWNLOADED,
      handleSquirrelUpdateError: actions.SQUIRREL_UPDATE_ERROR,
      handleSquirrelInstallUpdate: actions.SQUIRREL_INSTALL_UPDATE,
      handleSquirrelUpdateDisabled: actions.SQUIRREL_UPDATE_DISABLED,

      // Checking
      handleScheduleNextUpdateCheck: actions.SCHEDULE_NEXT_UPDATE_CHECK,
      handleCheckForUpdates: actions.CHECK_FOR_UPDATES,
      handleUserCheckForUpdates: actions.USER_CHECK_FOR_UPDATES
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Shows the user prompt for the correct state etc
  * @param userActionedUpdate=autoget: true if the user actioned the update
  * @param updateState=autoget: the current update state
  * @return true if the user was prompted
  */
  showUserPrompt () {
    if (this.updateState === UPDATE_STATES.CHECKING || this.updateState === UPDATE_STATES.DOWNLOADING) {
      if (this.userActionedUpdate) {
        window.location.hash = this.squirrelEnabled
          ? `/updates/checking/squirrel`
          : `/updates/checking/manual`
        return true
      }
    } else if (this.updateState === UPDATE_STATES.DOWNLOADED) {
      const qs = querystring.stringify({
        installmethod: DistributionConfig.installMethod,
        osPackageManager: this.osPackageManager
      })
      window.location.hash = this.squirrelEnabled
        ? `/updates/install/squirrel?${qs}`
        : `/updates/available/manual?${qs}`
      return true
    } else if (this.updateState === UPDATE_STATES.NONE) {
      if (this.userActionedUpdate) {
        window.location.hash = this.squirrelEnabled
          ? `/updates/none/squirrel`
          : `/updates/none/manual`
        return true
      }
    } else if (this.updateState === UPDATE_STATES.ERROR) {
      if (this.userActionedUpdate || this.updateFailedCount > 5) {
        window.location.hash = this.squirrelEnabled
          ? `/updates/error/squirrel`
          : `/updates/error/manual`
        if (this.updateFailedCount > 5) {
          this.updateFailedCount = 0 // Reset to prevent bugging the user
        }
        return true
      }
    }
    return false
  }

  /**
  * Generates the querstring to use in the update check
  */
  generateUpdateQueryString () {
    const updateChannel = settingsStore.getState().app.updateChannel
    return querystring.stringify({
      v: pkg.version,
      bid: pkg.earlyBuildId || 'release',
      mode: this.userActionedUpdate ? 'manual' : 'auto',
      channel: updateChannel,
      platform: process.platform,
      arch: process.arch,
      installmethod: DistributionConfig.installMethod
    })
  }

  /* **************************************************************************/
  // Handlers: Lifecycle
  /* **************************************************************************/

  handleLoad () {
    clearTimeout(this.nextCheckTO)
    this.lastManualDownloadUrl = null

    WBRPCRenderer.wavebox.fetchUpdaterConfig().then(
      (config) => {
        this.osPackageManager = config.osPackageManager
        this.emitChange()
        actions.checkForUpdates.defer()
      },
      (ex) => {
        console.error('Failed to fetch updater config. Continuing in unknown state')
        actions.checkForUpdates.defer()
      }
    )
  }

  handleUnload () {
    clearTimeout(this.nextCheckTO)
    this.lastManualDownloadUrl = null
  }

  /* **************************************************************************/
  // Handlers: Squirrel
  /* **************************************************************************/

  handleSquirrelUpdateCheckStart () {
    console.log('[Squirrel] checking for updates')

    this.updateState = UPDATE_STATES.CHECKING
    if (this.userActionedUpdate) {
      this.showUserPrompt()
    }
  }

  handleSquirrelUpdateAvailable () {
    console.log('[Squirrel] Update Available')
    this.updateState = UPDATE_STATES.DOWNLOADING
  }

  handleSquirrelUpdateNotAvailable () {
    console.log('[Squirrel] No updates available')

    this.updateState = UPDATE_STATES.NONE
    this.updateFailedCount = 0
    if (this.userActionedUpdate) {
      this.showUserPrompt()
      this.userActionedUpdate = false
    }

    // Check for the next update
    actions.scheduleNextUpdateCheck.defer()
  }

  handleSquirrelUpdateDownloaded () {
    console.log('[Squirrel] Update downloaded')

    this.updateState = UPDATE_STATES.DOWNLOADED
    this.updateFailedCount = 0
    this.showUserPrompt()
    this.userActionedUpdate = false
  }

  handleSquirrelUpdateError () {
    console.log('[Squirrel] Update error')

    this.updateState = UPDATE_STATES.ERROR
    this.updateFailedCount = this.updateFailedCount + 1
    this.showUserPrompt()
    this.userActionedUpdate = false
    actions.scheduleNextUpdateCheck.defer()
  }

  handleSquirrelInstallUpdate () {
    ipcRenderer.send(WB_SQUIRREL_APPLY_UPDATE, {})
  }

  handleSquirrelUpdateDisabled () {
    console.log('[Squirrel] Disabled')
    if (this.squirrelEnabled) {
      this.updateState = UPDATE_STATES.ERROR
      this.updateFailedCount = 0
      this.squirrelEnabled = false
      actions.checkForUpdates.defer()
    }
  }

  /* **************************************************************************/
  // Handlers: Updates
  /* **************************************************************************/

  handleScheduleNextUpdateCheck () {
    clearTimeout(this.nextCheckTO)
    this.nextCheckTO = setTimeout(() => {
      actions.checkForUpdates.defer()
    }, UPDATE_CHECK_INTERVAL)
  }

  handleCheckForUpdates () {
    if (!settingsStore.getState().app.checkForUpdates) {
      this.preventDefault()
      return
    }

    if (this.isWorking()) {
      actions.scheduleNextUpdateCheck.defer()
    } else if (this.isDownloadedUpdate()) {
      this.showUserPrompt()
    } else {
      this.userActionedUpdate = false
      if (this.squirrelEnabled) {
        this.checkForSquirrelUpdates()
      } else {
        this.checkForManualUpdates()
      }
    }
  }

  handleUserCheckForUpdates () {
    this.userActionedUpdate = true

    if (this.isWorking() || this.isDownloadedUpdate()) {
      this.showUserPrompt()
    } else {
      if (this.squirrelEnabled) {
        this.checkForSquirrelUpdates()
      } else {
        this.checkForManualUpdates()
      }
    }
  }

  /* **************************************************************************/
  // Update Actioners
  /* **************************************************************************/

  /**
  * Checks for updates using squirrel
  */
  checkForSquirrelUpdates () {
    if (process.platform === 'darwin') {
      // Squirrel does the donkey work for us on osx and checks the server for the update path
      this.updateState = UPDATE_STATES.CHECKING
      this.showUserPrompt()
      ipcRenderer.send(WB_SQUIRREL_UPDATE_CHECK, {
        url: `${UPDATE_FEED_DARWIN}?${this.generateUpdateQueryString()}`
      })
    } else if (process.platform === 'win32') {
      // Squirrel win32 needs a url it can resolve two files, so find out from wavebox where that is!
      this.updateState = UPDATE_STATES.CHECKING
      this.showUserPrompt()
      Promise.resolve()
        .then(() => {
          if (process.arch === 'x64') {
            return window.fetch(`${UPDATE_FEED_WIN32_X64}?${this.generateUpdateQueryString()}`)
          } else if (process.arch === 'ia32') {
            return window.fetch(`${UPDATE_FEED_WIN32_IA32}?${this.generateUpdateQueryString()}`)
          } else {
            return Promise.reject(new Error('Unsupported Platform'))
          }
        })
        .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
        .then((res) => {
          if (res.status === 204) {
            actions.squirrelUpdateNotAvailable.defer()
          } else {
            return Promise.resolve()
              .then(() => res.json())
              .then((res) => {
                ipcRenderer.send(WB_SQUIRREL_UPDATE_CHECK, { url: res.url })
                this.updateState = UPDATE_STATES.DOWNLOADING
                this.showUserPrompt()
                this.emitChange()
              })
          }
        })
        .catch(() => {
          actions.squirrelUpdateError.defer()
        })
    }
  }

  /**
  * Checks for updates using the manual endpoint
  */
  checkForManualUpdates () {
    this.updateState = UPDATE_STATES.CHECKING
    this.showUserPrompt()

    Promise.resolve()
      .then(() => window.fetch(`${UPDATE_FEED_MANUAL}?${this.generateUpdateQueryString()}`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => {
        if (res.available) {
          this.lastManualDownloadUrl = res.url
          this.updateState = UPDATE_STATES.DOWNLOADED
          this.showUserPrompt()
        } else {
          this.lastManualDownloadUrl = null
          this.updateState = UPDATE_STATES.NONE
          this.showUserPrompt()
        }

        // Reset for next run
        this.userActionedUpdate = false
        this.emitChange()
      })
      .catch(() => {
        this.updateState = UPDATE_STATES.ERROR
        this.updateFailedCount = this.updateFailedCount + 1

        this.showUserPrompt()

        // Reset for next run
        this.userActionedUpdate = false
        actions.scheduleNextUpdateCheck.defer()
        this.emitChange()
      })
  }
}

export default alt.createStore(UpdaterStore, 'UpdaterStore')
