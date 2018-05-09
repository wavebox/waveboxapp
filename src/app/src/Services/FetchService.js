import { ipcMain } from 'electron'
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
  // Tools
  /* ****************************************************************************/

  /**
  * Builds the headers dictionary
  * @param ses: the session we're actioning
  * @param url: the url we're visiting
  * @param options: the options passed to the request
  * @return promise: a dictionary of headers key, value
  */
  _buildHeaders (ses, url, options) {
    if (options.credentials === 'include') {
      return new Promise((resolve, reject) => {
        ses.cookies.get({ url: url }, (_err, cookies) => {
          const cookieStr = cookies.reduce((acc, cookie) => {
            return `${acc}${cookie.name}=${cookie.value};`
          }, '')

          resolve({
            ...options.headers,
            cookie: cookieStr
          })
        })
      })
    } else {
      return Promise.resolve(options.headers || {})
    }
  }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Fetches a text response from the server
  * @param evt: the ipc event
  * @param returnChannel: the ipc channel to send the response to
  * @param partitionId: the id of the partition to use
  * @param url: the url to fetch
  * @param options: additional options to give to the fetch library
  */
  _handleIPCFetchText = (evt, returnChannel, partitionId, url, options = {}) => {
    if (evt.sender.getWebPreferences().nodeIntegration !== true) { return }
    const ses = SessionManager.fromPartition(partitionId)

    Promise.resolve()
      .then(() => this._buildHeaders(ses, url, options))
      .then((headers) => {
        return fetch(url, {
          ...options,
          headers: headers,
          useElectronNet: true,
          session: ses
        })
      })
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(new Error(`HTTP status not ok: ${res.httpStatus}`)))
      .then((res) => res.text())
      .then((res) => {
        if (evt.sender.isDestroyed()) { return }
        evt.sender.send(returnChannel, null, res)
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
