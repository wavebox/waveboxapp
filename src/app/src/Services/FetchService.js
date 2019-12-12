import { ipcMain, session, BrowserWindow } from 'electron'
import fetch from 'electron-fetch'
import { SessionManager } from 'SessionManager'
import { WB_FETCH_SERVICE_TEXT, WB_WCFETCH_SERVICE_TEXT, WB_WCFETCH_SERVICE_TEXT_CLEANUP } from 'shared/ipcEvents'
import uuid from 'uuid'
import Resolver from 'Runtime/Resolver'

class FetchService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_FETCH_SERVICE_TEXT, this._handleIPCFetchText)
    ipcMain.on(WB_WCFETCH_SERVICE_TEXT, this._handleIPCWCFetchText)
    ipcMain.on(WB_WCFETCH_SERVICE_TEXT_CLEANUP, this._handleIPCWCFetchTextCleanup)

    this.wcFetchers = new Map()
    this.wcFetchersExpirer = setInterval(() => {
      const now = Date.now()
      Array.from(this.wcFetchers.entries()).forEach(([key, value]) => {
        if (now - value.ts > 60000 * 10) {
          this.wcFetchers.delete(key)
          if (value.win) {
            value.win.destroy()
          }
        }
      })
    }, 10000)
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

  _handleIPCWCFetchTextCleanup = (evt, baseUrl, partitionId) => {
    const key = `${partitionId}:${baseUrl}`
    const rec = this.wcFetchers.get(key)
    if (rec) {
      if (rec.resolvers && rec.resolvers.length) { return }
      this.wcFetchers.delete(key)
      rec.win.destroy()
    }
  }

  _handleIPCWCFetchText = (evt, returnChannel, baseUrl, partitionId, url, options = {}) => {
    if (evt.sender.getWebPreferences().nodeIntegration !== true) { return }

    const fetcherKey = `${partitionId}:${baseUrl}`
    Promise.resolve()
      .then(() => {
        if (this.wcFetchers.has(fetcherKey)) {
          const rec = this.wcFetchers.get(fetcherKey)
          rec.ts = Date.now()
          if (rec.win) {
            return Promise.resolve(rec.win)
          } else {
            return new Promise((resolve) => {
              rec.resolvers.push(resolve)
            })
          }
        } else {
          return new Promise((resolve) => {
            const rec = {
              win: undefined,
              ts: Date.now(),
              resolvers: [resolve]
            }
            this.wcFetchers.set(fetcherKey, rec)

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
                offscreen: true,
                preload: Resolver.guestPreload()
              }
            })
            win.webContents.setFrameRate(1)
            win.webContents.once('did-navigate', (evt, url, statusCode) => {
              rec.win = win
              rec.resolvers.forEach((resolver) => resolver(win))
              rec.resolvers = []
            })
            win.loadURL(baseUrl)
          })
        }
      })
      .then((win) => {
        return new Promise((resolve) => {
          const channel = uuid.v4()
          ipcMain.once(channel, (evt, res) => {
            resolve(res)
          })
          win.webContents.send('WB_WCFETCH_SERVICE_TEXT_RUNNER', channel, url, options)
        })
      })
      .then(({ ok, status, body }) => {
        if (evt.sender.isDestroyed()) { return Promise.resolve() }
        evt.sender.send(returnChannel, null, {
          ok: ok,
          status: status
        }, body)
        return Promise.resolve()
      })
      .catch((ex) => {
        if (evt.sender.isDestroyed()) { return Promise.resolve() }
        evt.sender.send(returnChannel, null, {
          ok: false,
          status: -1
        }, 'error')
        return Promise.resolve()
      })
      .then(() => {
        // Cleanup
        const fetcher = this.wcFetchers.get(fetcherKey)
        if (fetcher) {
          fetcher.ts = Date.now()
        }
      })
  }
}

export default FetchService
