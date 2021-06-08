import alt from '../alt'
import {
  WB_USER_CHECK_FOR_UPDATE,
  WB_SQUIRREL_UPDATE_DOWNLOADED,
  WB_SQUIRREL_UPDATE_ERROR,
  WB_SQUIRREL_UPDATE_AVAILABLE,
  WB_SQUIRREL_UPDATE_NOT_AVAILABLE,
  WB_SQUIRREL_UPDATE_CHECK_START,
  WB_SQUIRREL_UPDATE_DISABLED
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

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
}

const actions = alt.createActions(UpdaterActions)
ipcRenderer.on(WB_SQUIRREL_UPDATE_DOWNLOADED, () => actions.squirrelUpdateDownloaded())
ipcRenderer.on(WB_SQUIRREL_UPDATE_ERROR, () => actions.squirrelUpdateError())
ipcRenderer.on(WB_SQUIRREL_UPDATE_AVAILABLE, () => actions.squirrelUpdateAvailable())
ipcRenderer.on(WB_SQUIRREL_UPDATE_NOT_AVAILABLE, () => actions.squirrelUpdateNotAvailable())
ipcRenderer.on(WB_SQUIRREL_UPDATE_CHECK_START, () => actions.squirrelUpdateCheckStart())
ipcRenderer.on(WB_SQUIRREL_UPDATE_DISABLED, () => actions.squirrelUpdateDisabled())
ipcRenderer.on(WB_USER_CHECK_FOR_UPDATE, () => actions.userCheckForUpdates())
export default actions
