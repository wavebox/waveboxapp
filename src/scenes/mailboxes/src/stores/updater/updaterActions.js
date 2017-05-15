import alt from '../alt'
const { ipcRenderer } = window.nativeRequire('electron')

class UpdaterActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * Loads the store
  */
  load () { return {} }

  /**
  * Unloads the store
  */
  unload () { return {} }

  /* **************************************************************************/
  // Squirrel
  /* **************************************************************************/

  /**
  * Indicates that squirrel started checking for updates
  */
  squirrelUpdateCheckStart () { return { } }

  /**
  * Indicates that a squirrel update is available
  */
  squirrelUpdateAvailable () { return {} }

  /**
  * Indicates that a squirrel update is not available
  */
  squirrelUpdateNotAvailable () { return {} }

  /**
  * Indicates that a squirrel update has been downloaded
  */
  squirrelUpdateDownloaded () { return {} }

  /**
  * Indicates that a squirrely update failed
  */
  squirrelUpdateError () { return {} }

  /**
  * Installs the queued squirrel update
  */
  squirrelInstallUpdate () { return {} }

  /**
  * Indicates squirrel updates are disabled
  */
  squirrelUpdateDisabled () { return {} }

  /* **************************************************************************/
  // Update checking
  /* **************************************************************************/

  /**
  * Schedules the next update check
  */
  scheduleNextUpdateCheck () { return { } }

  /**
  * Checks for updates
  */
  checkForUpdates () { return { } }

  /**
  * Checks for updates and notifies the user of progress
  */
  userCheckForUpdates () { return { } }

  /**
  * Checks for squirrel updates (if supported by platform)
  */
  checkForSquirrelUpdates () { return { } }

  /**
  * Checks for manual download updates
  */
  checkForManualUpdates () { return { } }
}

const actions = alt.createActions(UpdaterActions)
ipcRenderer.on('squirrel-update-downloaded', () => actions.squirrelUpdateDownloaded())
ipcRenderer.on('squirrel-update-error', () => actions.squirrelUpdateError())
ipcRenderer.on('squirrel-update-available', () => actions.squirrelUpdateAvailable())
ipcRenderer.on('squirrel-update-not-available', () => actions.squirrelUpdateNotAvailable())
ipcRenderer.on('squirrel-update-check-start', () => actions.squirrelUpdateCheckStart())
ipcRenderer.on('squirrel-update-disabled', () => actions.squirrelUpdateDisabled())
ipcRenderer.on('user-check-for-updates', () => actions.userCheckForUpdates())
export default actions
