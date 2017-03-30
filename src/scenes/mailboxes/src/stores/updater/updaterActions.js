const alt = require('../alt')
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
  * Indicates that a squirrel update has been downloaded
  */
  squirrelUpdateDownloaded () { return {} }

  /**
  * Indicates that a squirrely update failed
  */
  squirrelUpdateError () { return {} }

  /**
  * Indicates that a squirrel update is available
  */
  squirrelUpdateAvailable () { return {} }

  /**
  * Indicates that a squirrel update is not available
  */
  squirrelUpdateNotAvailable () { return {} }

  /**
  * Installs the queued squirrel update
  */
  squirrelInstallUpdate () { return {} }

  /**
  * Indicates that squirrel started checking for updates
  */
  squirrelUpdateCheckStart () { return { } }

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
module.exports = actions
