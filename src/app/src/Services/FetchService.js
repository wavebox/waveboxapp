import { ipcMain, session, BrowserWindow } from 'electron'
import fetch from 'electron-fetch'
import { SessionManager } from 'SessionManager'
import { WB_FETCH_SERVICE_TEXT, WB_WCFETCH_SERVICE_TEXT } from 'shared/ipcEvents'

class FetchService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_FETCH_SERVICE_TEXT, this._handleIPCFetchText)
    ipcMain.on(WB_WCFETCH_SERVICE_TEXT, this._handleIPCWCFetchText)

    this.wcFetchers = new Map()
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

  _handleIPCWCFetchText = (evt, returnChannel, partitionId, url, options = {}) => {
    if (evt.sender.getWebPreferences().nodeIntegration !== true) { return }
    Promise.resolve()
      .then(() => new Promise((resolve) => {
        const win = new BrowserWindow({
          width: 1,
          height: 1,
          show: false,
          focusable: false,
          skipTaskbar: true,
          webPreferences: {
            backgroundThrottling: false,
            contextIsolation: true,
            partition: partitionId,
            sandbox: true,
            nativeWindowOpen: true,
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            webviewTag: false,
            offscreen: true
          }
        })
        win.webContents.setFrameRate(1)
        win.webContents.once('did-navigate', (evt, url, statusCode) => {
          win.webContents.executeJavaScript('document.documentElement.outerText', (res) => {
            win.destroy()
            resolve({
              ok: statusCode >= 200 && statusCode <= 299,
              status: statusCode,
              body: res
            })
          })
        })
        win.loadURL(url)
      }))
      .then(({ ok, status, body }) => {
        if (evt.sender.isDestroyed()) { return Promise.resolve() }
        evt.sender.send(returnChannel, null, {
          ok: ok,
          status: status
        }, body)
      })
      .catch((ex) => {
        console.log(">>>>",ex)
        if (evt.sender.isDestroyed()) { return Promise.resolve() }
        evt.sender.send(returnChannel, null, {
          ok: false,
          status: -1
        }, 'error')
      })
  }
}

export default FetchService
