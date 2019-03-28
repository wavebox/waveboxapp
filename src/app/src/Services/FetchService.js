import { ipcMain, session } from 'electron'
import fetch from 'electron-fetch'
import { SessionManager } from 'SessionManager'
import { WB_FETCH_SERVICE_TEXT } from 'shared/ipcEvents'

class FetchService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_FETCH_SERVICE_TEXT, this._handleIPCFetchText)
  }

  /* ****************************************************************************/
  // Request
  /* ****************************************************************************/

  /**
  * Fetches a text response from the server
  * @param evt: the ipc event
  * @param returnChannel: the ipc channel to send the response to
  * @param partitionId=undefined: the id of the partition to use
  * @param url: the url to fetch
  * @param options: additional options to give to the fetch library
  */
  _handleIPCFetchText = (evt, returnChannel, partitionId, url, options = {}) => {
    if (evt.sender.getWebPreferences().nodeIntegration !== true) { return }

    const ses = partitionId
      ? SessionManager.fromPartition(partitionId)
      : session.defaultSession
    const isSessionlessRequest = !partitionId

    Promise.resolve()
      .then(() => {
        return fetch(url, {
          ...options,
          credentials: isSessionlessRequest ? options.credentials : undefined,
          useElectronNet: true,
          session: ses
        })
      })
      .then((res) => {
        return Promise.resolve()
          .then(() => res.text())
          .then((body) => {
            return { res, body }
          })
      })
      .then(({ res, body }) => {
        if (evt.sender.isDestroyed()) { return }
        evt.sender.send(returnChannel, null, {
          ok: res.ok,
          status: res.status
        }, body)
      })
      .catch((err) => {
        if (evt.sender.isDestroyed()) { return }
        evt.sender.send(returnChannel, {
          name: 'Error',
          message: err && err.message ? err.message : 'Unknown Error'
        })
      })
  }
}

export default FetchService
