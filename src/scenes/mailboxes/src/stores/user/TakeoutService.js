import { ipcRenderer } from 'electron'
import uuid from 'uuid'

import {
  WB_TAKEOUT_EXPORT_SERVER,
  WB_TAKEOUT_EXPORT_SERVER_,
  WB_TAKEOUT_EXPORT_SERVER_CHANGESET,
  WB_TAKEOUT_EXPORT_SERVER_CHANGESET_,
  WB_TAKEOUT_IMPORT_SERVER
} from 'shared/ipcEvents'

class TakeoutService {
  /**
  * Makes a request to ipc endpoint for export data
  * @return promise
  */
  static exportDataForServer () {
    return new Promise((resolve, reject) => {
      const responseChannel = `${WB_TAKEOUT_EXPORT_SERVER_}${uuid.v4()}`
      ipcRenderer.once(responseChannel, (evt, data) => {
        resolve(data)
      })
      ipcRenderer.send(WB_TAKEOUT_EXPORT_SERVER, responseChannel)
    })
  }

  /**
  * Makes a request to ipc endpoint for export data changeset
  * @param changeset: the changeset to request
  * @return promise
  */
  static exportDataChangesetForServer (changeset) {
    return new Promise((resolve, reject) => {
      const responseChannel = `${WB_TAKEOUT_EXPORT_SERVER_CHANGESET_}${uuid.v4()}`
      ipcRenderer.once(responseChannel, (evt, data) => {
        resolve(data)
      })
      ipcRenderer.send(WB_TAKEOUT_EXPORT_SERVER_CHANGESET, changeset, responseChannel)
    })
  }

  /**
  * Restores the data from the server
  * @param data: the data to restore
  */
  static restoreDataFromServer (data) {
    ipcRenderer.send(WB_TAKEOUT_IMPORT_SERVER, data)
  }
}

export default TakeoutService
