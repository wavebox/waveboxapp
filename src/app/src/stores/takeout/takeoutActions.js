import alt from '../alt'
import { WB_TAKEOUT_IMPORT, WB_TAKEOUT_EXPORT } from 'shared/ipcEvents'
import {ipcMain} from 'electron'

class TakeoutActions {
  load () { return {} }

  /**
  * Exports the data to disk with a file picker dialog etc
  */
  exportDataToDisk () { return {} }

  /**
  * Imports the data from disk with a file picker dialog etc
  */
  importDataFromDisk () { return {} }
}

const actions = alt.createActions(TakeoutActions)
ipcMain.on(WB_TAKEOUT_IMPORT, () => actions.importDataFromDisk())
ipcMain.on(WB_TAKEOUT_EXPORT, () => actions.exportDataToDisk())
export default actions
