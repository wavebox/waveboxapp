import alt from '../alt'
import actions from './updaterActions'
import settingsStore from '../settings/settingsStore'
import {
  UPDATE_CHECK_INTERVAL,
  UPDATE_FEED_MANUAL,
  UPDATE_FEED_DARWIN,
  UPDATE_FEED_WIN32_IA32,
  UPDATE_FEED_WIN32_X64
} from 'shared/constants'

const { ipcRenderer } = window.nativeRequire('electron')
const pkg = window.appPackage()

class UpdaterStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.nextCheckTO = null
    this.lastManualDownloadUrl = null

    /* **************************************/
    // Listeners
    /* **************************************/

    this.bindListeners({
      handleLoad: actions.LOAD,
      handleUnload: actions.UNLOAD,

      // Squirrel
      handleSquirrelUpdateDownloaded: actions.SQUIRREL_UPDATE_DOWNLOADED,
      handleSquirrelUpdateError: actions.SQUIRREL_UPDATE_ERROR,
      handleSquirrelUpdateAvailable: actions.SQUIRREL_UPDATE_AVAILABLE,
      handleSquirrelUpdateNotAvailable: actions.SQUIRREL_UPDATE_NOT_AVAILABLE,
      handleSquirrelInstallUpdate: actions.SQUIRREL_INSTALL_UPDATE,
      handleSquirrelUpdateCheckStart: actions.SQUIRREL_UPDATE_CHECK_START,

      // Checking
      handleScheduleNextUpdateCheck: actions.SCHEDULE_NEXT_UPDATE_CHECK,
      handleCheckForUpdates: actions.CHECK_FOR_UPDATES,
      handleCheckForSquirrelUpdates: actions.CHECK_FOR_SQUIRREL_UPDATES,
      handleCheckForManualUpdates: actions.CHECK_FOR_MANUAL_UPDATES
    })
  }

  /* **************************************************************************/
  // Handlers: Lifecycle
  /* **************************************************************************/

  handleLoad () {
    clearTimeout(this.nextCheckTO)
    this.lastManualDownloadUrl = null
  }

  handleUnload () {
    clearTimeout(this.nextCheckTO)
    this.lastManualDownloadUrl = null
  }

  /* **************************************************************************/
  // Handlers: Squirrel
  /* **************************************************************************/

  handleSquirrelUpdateDownloaded () {
    window.location.hash = '/updates/squirrel/install'
  }

  handleSquirrelUpdateError () {
    console.log('[Squirrel] update error')
    actions.checkForManualUpdates.defer()
  }

  handleSquirrelUpdateAvailable () {
    console.log('[Squirrel] Update Available')
  }

  handleSquirrelUpdateNotAvailable () {
    console.log('[Squirrel] no updates available')
  }

  handleSquirrelInstallUpdate () {
    ipcRenderer.send('squirrel-apply-update', {})
  }

  handleSquirrelUpdateCheckStart () {
    console.log('[Squirrel] checking for updates')
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
    this.preventDefault()

    if (process.platform === 'darwin' || process.platform === 'win32') {
      actions.checkForSquirrelUpdates.defer()
    } else {
      actions.checkForManualUpdates.defer()
    }
  }

  handleCheckForSquirrelUpdates () {
    this.preventDefault() // No change to store
    if (!settingsStore.getState().app.checkForUpdates) { return }

    if (process.platform === 'darwin') {
      // Squirrel does the donkey work for us on osx and checks the server for the update path
      ipcRenderer.send('squirrel-update-check', {
        url: `${UPDATE_FEED_DARWIN}?v=${pkg.version}`
      })
    } else if (process.platform === 'win32') {
      // Squirrel win32 needs a url it can resolve two files, so find out from wavebox where that is!
      Promise.resolve()
        .then(() => {
          if (process.arch === 'x64') {
            return window.fetch(`${UPDATE_FEED_WIN32_X64}?v=${pkg.version}`)
          } else if (process.arch === 'ia32') {
            return window.fetch(`${UPDATE_FEED_WIN32_IA32}?v=${pkg.version}`)
          } else {
            return Promise.reject(new Error('Unsupported Platform'))
          }
        })
        .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
        .then((res) => res.json())
        .then((res) => {
          if (res.status !== 204) {
            ipcRenderer.send('squirrel-update-check', { url: res.url })
          }
        })
        .catch(() => {
          // If we fail then make sure we do at least try again in the future!
          actions.scheduleNextUpdateCheck.defer()
        })
    }
  }

  handleCheckForManualUpdates () {
    this.preventDefault() // No change to this store
    if (!settingsStore.getState().app.checkForUpdates) { return }

    Promise.resolve()
      .then(() => window.fetch(`${UPDATE_FEED_MANUAL}?v=${pkg.version}`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => {
        if (res.available) {
          this.lastManualDownloadUrl = res.url
          window.location.hash = '/updates/manual/available'
        } else {
          this.lastManualDownloadUrl = null
        }
      })
      .catch(() => {
        // If we fail then make sure we do at least try again in the future!
        actions.scheduleNextUpdateCheck.defer()
      })
  }
}

export default alt.createStore(UpdaterStore, 'UpdaterStore')
