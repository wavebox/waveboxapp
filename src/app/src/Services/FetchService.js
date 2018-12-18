import { ipcMain, session } from 'electron'
import fetch from 'electron-fetch'
import { SessionManager } from 'SessionManager'
import {
  WB_FETCH_SERVICE_TEXT,
  WB_FETCH_SERVICE_SESSIONLESS_TEXT,
  WB_FETCH_SERVICE_SESSIONLESS_JSON
} from 'shared/ipcEvents'

class FetchService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_FETCH_SERVICE_TEXT, this._handleIPCFetchText)
    ipcMain.on(WB_FETCH_SERVICE_SESSIONLESS_TEXT, this._handleIPCFetchSessionlessText)
    ipcMain.on(WB_FETCH_SERVICE_SESSIONLESS_JSON, this._handleIPCFetchSessionlessJson)
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
  // Request
  /* ****************************************************************************/

  /**
  * Executes a standardised ipc fetch
  * @param sender: the webcontents that requestsed
  * @param ses: the session to use
  * @param cookies: true to send cookies, false otherwise
  * @param options: the request options
  * @param deserializer: the deserializer to call on success
  * @param returnChannel: the ipc channel to send the response to
  */
  _executeIPCFetch (sender, ses, cookies, url, options, deserializer, returnChannel) {
    if (sender.getWebPreferences().nodeIntegration !== true) { return }

    Promise.resolve()
      .then(() => {
        return cookies
          ? this._buildHeaders(ses, url, options)
          : options.headers || {}
      })
      .then((headers) => {
        return fetch(url, {
          ...options,
          headers: headers,
          useElectronNet: true,
          session: ses
        })
      })
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(new Error(`HTTP status not ok: ${res.httpStatus}`)))
      .then(deserializer)
      .then((res) => {
        if (sender.isDestroyed()) { return }
        sender.send(returnChannel, null, res)
      })
      .catch((err) => {
        if (sender.isDestroyed()) { return }
        sender.send(returnChannel, {
          name: 'Error',
          message: err && err.message ? err.message : 'Unknown Error'
        })
      })
  }

  /* ****************************************************************************/
  // Event handlers
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
    this._executeIPCFetch(
      evt.sender,
      SessionManager.fromPartition(partitionId),
      true,
      url,
      options,
      (res) => res.text(),
      returnChannel
    )
  }

  /**
  * Fetches a text response from the server with no session
  * @param evt: the ipc event
  * @param returnChannel: the ipc channel to send the response to
  * @param url: the url to fetch
  * @param options: additional options to give to the fetch library
  */
  _handleIPCFetchSessionlessText = (evt, returnChannel, url, options = {}) => {
    this._executeIPCFetch(
      evt.sender,
      session.defaultSession,
      false,
      url,
      options,
      (res) => res.text(),
      returnChannel
    )
  }

  /**
  * Fetches a json response from the server with no session
  * @param evt: the ipc event
  * @param returnChannel: the ipc channel to send the response to
  * @param url: the url to fetch
  * @param options: additional options to give to the fetch library
  */
  _handleIPCFetchSessionlessJson = (evt, returnChannel, url, options = {}) => {
    this._executeIPCFetch(
      evt.sender,
      session.defaultSession,
      false,
      url,
      options,
      (res) => res.json(),
      returnChannel
    )
  }
}

export default FetchService
