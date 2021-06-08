import { session, app, dialog, BrowserWindow, ipcMain } from 'electron'
import { EventEmitter } from 'events'
import uuid from 'uuid'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import unusedFilename from 'unused-filename'
import WaveboxWindow from 'Windows/WaveboxWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'
import ElectronCookie from 'ElectronTools/ElectronCookie'
import fetch from 'electron-fetch'
import mime from 'mime'
import AsyncDownloadItem from './AsyncDownloadItem'
import { WB_DOWNLOAD_CANCEL_RUNNING } from 'shared/ipcEvents'

const MAX_PLATFORM_START_TIME = 1000 * 30
const privUser = Symbol('privUser')
const privPlatform = Symbol('privPlatform')

class DownloadManager extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    this[privUser] = {
      partitions: new Set(),
      inProgress: new Map(),
      lastPath: null
    }
    this[privPlatform] = {
      queue: new Map()
    }

    ipcMain.on(WB_DOWNLOAD_CANCEL_RUNNING, this._handleCancelRunningDownload)
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  _getMailboxesWindow () { return WaveboxWindow.getOfType(MailboxesWindow) }

  /* ****************************************************************************/
  // IPC Event listeners
  /* ****************************************************************************/

  /**
  * Attempts to cancel a running user download
  * @param evt: the event that fired
  * @Param downloadId: the id of the download
  */
  _handleCancelRunningDownload = (evt, downloadId) => {
    const download = this[privUser].inProgress.get(downloadId)
    if (!download || !download.item) {
      // If we don't know about the download make sure we re-emit
      // that we failed so the app isn't left with ghost downloads
      this.emit('download-failed', { sender: this }, {
        id: downloadId
      })
    } else {
      download.item.cancel()
    }
  }

  /* ****************************************************************************/
  // User downloads
  /* ****************************************************************************/

  /**
  * Adds the user download manager to the given partition
  * @param partition: the partition to listen on
  */
  setupUserDownloadHandlerForPartition (partition) {
    if (this[privUser].partitions.has(partition)) { return }
    this[privUser].partitions.add(partition)

    const ses = session.fromPartition(partition)
    ses.setDownloadPath(app.getPath('downloads'))
    ses.on('will-download', this._handleUserDownload)
  }

  /**
  * Removes the download manager for given partition
  * @param partition: the partition to teardown
  */
  teardownUserDownloadHandlerForPartition (partition) {
    if (!this[privUser].partitions.has(partition)) { return }
    this[privUser].partitions.delete(partition)

    const ses = session.fromPartition(partition)
    ses.removeListener('will-download', this._handleUserDownload)
  }

  /* ****************************************************************************/
  // User downloads: Handlers
  /* ****************************************************************************/

  /**
  * Handles a user download
  * @param evt: the event that fired
  * @param item: the download item
  * @param wc: the webcontents that triggered the vent
  */
  _handleUserDownload = (evt, item, wc) => {
    if (this._isPlatformDownload(item, wc)) { return }

    const settingsState = settingsStore.getState()

    if (userStore.getState().wceUseAsyncDownloadHandler(settingsState.os.rawUseAsyncDownloadHandler)) {
      // You have to be careful handling downloads as some urls will come in as...
      // http://myurl which works fine
      // blob:http:// which is a in-page object
      // to work around this, use the default download hanlder silently in the background
      // and whilst the download is in progress prompt the user to download etc
      item = new AsyncDownloadItem(item)
      let downloadPath

      // Report the progress to the window to display it
      this._handleUserDownloadStarted(item.downloadId, item, downloadPath)
      item.on('updated', () => {
        if (item.isWaitingSetup()) { return }
        this._handleUserDownloadUpdated(item.downloadId, item, downloadPath)
      })
      item.on('done', (e, state) => {
        if (item.isWaitingSetup()) { return }
        if (state === 'completed') {
          this._handleUserDownloadFinished(item.downloadId, item, downloadPath)
        } else {
          this._handleUserDownloadFailed(item.downloadId, item, downloadPath)
        }
      })

      // Prompt the user for the save location
      Promise.resolve()
        .then(() => {
          const itemFilename = item.getFilename()
          // Download target picking
          if (!settingsState.os.alwaysAskDownloadLocation && settingsState.os.defaultDownloadLocation && fs.existsSync(settingsState.os.defaultDownloadLocation)) {
            const savePath = unusedFilename.sync(path.join(settingsState.os.defaultDownloadLocation, itemFilename))
            return Promise.resolve(savePath)
          } else {
            return new Promise((resolve, reject) => {
              const lastPath = this[privUser].lastPath
              const parentWindow = BrowserWindow.fromWebContents(wc.hostWebContents ? wc.hostWebContents : wc)
              dialog.showSaveDialog(parentWindow, {
                title: 'Download',
                defaultPath: path.join(lastPath || app.getPath('downloads'), itemFilename)
              }, (pickedSavePath) => {
                // There's a bit of a pickle here. Whilst asking the user where to save
                // they may have omitted the file extension. At the same time they may chosen
                // a filename that is already taken. We don't have any in-built ui to handle
                // this so the least destructive way is to find a filename that is not
                // in use and just save to there. In any case if the user picks a path and
                // that file does already exist we should remove it
                if (pickedSavePath) {
                  // Remove existing file - save dialog prompts before allowing user to choose pre-existing name
                  try { fs.removeSync(pickedSavePath) } catch (ex) { /* no-op */ }

                  // User didn't add file extension
                  if (path.extname(pickedSavePath) !== path.extname(itemFilename)) {
                    pickedSavePath += path.extname(itemFilename)
                    pickedSavePath = unusedFilename.sync(pickedSavePath)
                  }
                  resolve(pickedSavePath)
                } else {
                  item.cancel()
                  this._handleUserDownloadFailed(item.downloadId, item, downloadPath)
                  reject(new Error('User cancelled'))
                }
              })
            })
          }
        })
        .then((pickedSavePath) => {
          // This means we finished the download before we could pick the save path.
          // Artificually fire the finish event
          const didFinishBeforePicked = item.isFinished()

          downloadPath = unusedFilename.sync(pickedSavePath)
          this[privUser].lastPath = path.dirname(downloadPath)
          item.setSavePath(downloadPath)

          if (didFinishBeforePicked) {
            if (item.finishedState() === 'completed') {
              this._handleUserDownloadFinished(item.downloadId, item, downloadPath)
            } else {
              this._handleUserDownloadFailed(item.downloadId, item, downloadPath)
            }
          }
        })
        .catch((ex) => { /* no-op */ })
    } else {
      // Find out where to save the file
      let savePath
      if (!settingsState.os.alwaysAskDownloadLocation && settingsState.os.defaultDownloadLocation) {
        const folderLocation = settingsState.os.defaultDownloadLocation

        // Check the containing folder exists
        fs.ensureDirSync(folderLocation)
        savePath = unusedFilename.sync(path.join(folderLocation, item.getFilename()))
      } else {
        const lastPath = this[privUser].lastPath
        const parentWindow = BrowserWindow.fromWebContents(wc.hostWebContents ? wc.hostWebContents : wc)
        let pickedSavePath = dialog.showSaveDialog(parentWindow, {
          title: 'Download',
          defaultPath: path.join(lastPath || app.getPath('downloads'), item.getFilename())
        })

        // There's a bit of a pickle here. Whilst asking the user where to save
        // they may have omitted the file extension. At the same time they may chosen
        // a filename that is already taken. We don't have any in-built ui to handle
        // this so the least destructive way is to find a filename that is not
        // in use and just save to there. In any case if the user picks a path and
        // that file does already exist we should remove it
        if (pickedSavePath) {
          // Remove existing file - save dialog prompts before allowing user to choose pre-existing name
          try { fs.removeSync(pickedSavePath) } catch (ex) { /* no-op */ }

          // User didn't add file extension
          if (path.extname(pickedSavePath) !== path.extname(item.getFilename())) {
            pickedSavePath += path.extname(item.getFilename())
            pickedSavePath = unusedFilename.sync(pickedSavePath)
          }
          savePath = pickedSavePath
        }
      }

      // Check we still want to save
      if (!savePath) {
        item.cancel()
        return
      }

      // Set the save - will prevent dialog showing up
      const downloadPath = unusedFilename.sync(savePath) // just-in-case
      this[privUser].lastPath = path.dirname(downloadPath)
      item.setSavePath(downloadPath)

      // Save some variables for later re-use
      const id = uuid.v4()
      this._handleUserDownloadStarted(id, item, downloadPath)

      item.on('updated', () => {
        this._handleUserDownloadUpdated(id, item, downloadPath)
      })
      item.on('done', (e, state) => {
        if (state === 'completed') {
          this._handleUserDownloadFinished(id, item, downloadPath)
        } else {
          this._handleUserDownloadFailed(id, item, downloadPath)
        }
      })
    }
  }

  /**
  * Updates the progress bar in the dock
  */
  _updateDownloadProgressBar = () => {
    const all = Array.from(this[privUser].inProgress.values()).reduce((acc, { received, total }) => {
      return {
        received: acc.received + received,
        total: acc.total + total
      }
    }, { received: 0, total: 0 })

    const mainWindow = this._getMailboxesWindow()
    if (mainWindow) {
      if (isNaN(all.received) || isNaN(all.total)) {
        mainWindow.setProgressBar(-1)
      } else if (all.received === 0 && all.total === 0) {
        mainWindow.setProgressBar(-1)
      } else {
        mainWindow.setProgressBar(all.received / all.total)
      }
    }
  }

  /* ****************************************************************************/
  // User downloads: download handlers
  /* ****************************************************************************/

  /**
  * Handles a user download starting
  * @param id: the id of the download
  * @param item: the download item
  * @param downloadPath: the path to download to
  */
  _handleUserDownloadStarted (id, item, downloadPath) {
    this[privUser].inProgress.set(id, {
      item: item,
      received: item.getReceivedBytes(),
      total: item.getTotalBytes()
    })
    this._updateDownloadProgressBar()
    this.emit('download-started', { sender: this }, {
      id: id,
      url: item.getURL(),
      filename: item.getFilename(),
      bytesReceived: item.getReceivedBytes(),
      bytesTotal: item.getTotalBytes(),
      downloadPath: downloadPath
    })
  }

  /**
  * Handles the download updating
  * @param id: the id of the download
  * @param item: the download item
  * @param downloadPath: the path to download to
  */
  _handleUserDownloadUpdated (id, item, downloadPath) {
    this[privUser].inProgress.set(id, {
      ...this[privUser].inProgress.get(id),
      received: item.getReceivedBytes(),
      total: item.getTotalBytes()
    })
    this._updateDownloadProgressBar()
    this.emit('download-updated', { sender: this }, {
      id: id,
      url: item.getURL(),
      filename: item.getFilename(),
      bytesReceived: item.getReceivedBytes(),
      bytesTotal: item.getTotalBytes(),
      downloadPath: downloadPath
    })
  }

  /**
  * Handles a download finishing in a success state
  * @param id: the id of the download
  * @param item: the download item
  * @param downloadPath: the path to download to
  */
  _handleUserDownloadFinished (id, item, downloadPath) {
    this[privUser].inProgress.delete(id)
    this._updateDownloadProgressBar()

    // Notify & bounce
    const saveName = path.basename(downloadPath)
    const mainWindow = this._getMailboxesWindow()
    if (mainWindow) {
      mainWindow.downloadCompleted(downloadPath, saveName)
    }
    if (process.platform === 'darwin') {
      app.dock.downloadFinished(downloadPath)
    }

    this.emit('download-finished', { sender: this }, {
      id: id,
      url: item.getURL(),
      filename: item.getFilename(),
      bytesTotal: item.getTotalBytes(),
      downloadPath: downloadPath
    })
  }

  /**
  * Handles a download finishing in an error state
  * @param id: the id of the download
  * @param item: the download item
  * @param downloadPath: the path to download to
  */
  _handleUserDownloadFailed (id, item, downloadPath) {
    this[privUser].inProgress.delete(id)
    this._updateDownloadProgressBar()
    try { fs.removeSync(downloadPath) } catch (ex) { /* no-op */ }

    this.emit('download-failed', { sender: this }, {
      id: id,
      url: item.getURL(),
      filename: item.getFilename(),
      downloadPath: downloadPath
    })
  }

  /* ****************************************************************************/
  // Platform downloads
  /* ****************************************************************************/

  /**
  * Starts a platform download to os temp folder
  * @param transportWebContents: the webcontents to run the download through
  * @param url: the url to download
  * @param downloadPath: the path to download to
  * @return promise with the save path
  */
  startPlatformDownloadToTemp (transportWebContents, url) {
    const id = uuid.v4().replace(/-/g, '')
    const tmpPath = path.join(os.tmpdir(), id)
    return this.startPlatformDownload(transportWebContents, url, tmpPath)
  }

  /**
  * Starts a platform download
  * @param transportWebContents: the webcontents to run the download through
  * @param url: the url to download
  * @param downloadPath: the path to download to
  * @return promise with the actual save path. This allows you to forego specifying an extension
  */
  startPlatformDownload (transportWebContents, url, downloadPath) {
    if (userStore.getState().wceUseAsyncDownloadHandler(settingsStore.getState().os.rawUseAsyncDownloadHandler)) {
      return Promise.resolve()
        .then(() => ElectronCookie.cookieHeaderForUrl(transportWebContents.session.cookies, url))
        .then((cookieHeader) => {
          return {
            'User-Agent': transportWebContents.session.getUserAgent(),
            'Cookie': cookieHeader
          }
        })
        .then((headers) => fetch(url, {
          headers: headers,
          useElectronNet: true,
          session: transportWebContents.session
        }))
        .then((res) => {
          if (res.ok) {
            const mimeExtension = mime.getExtension(res.headers.get('content-type'))
            const ext = mimeExtension ? `.${mimeExtension}` : null
            let actualSavePath = downloadPath
            if (ext && path.extname(downloadPath) !== ext) {
              actualSavePath = `${downloadPath}${ext}`
            }

            return new Promise((resolve, reject) => {
              const out = fs.createWriteStream(actualSavePath)

              res.body.pipe(out)
              res.body.on('error', (err) => { reject(err) })
              out.on('finish', () => { resolve(actualSavePath) })
              out.on('error', (err) => { reject(err) })
            })
          } else {
            return Promise.reject(new Error(`Invalid HTTP status code ${res.httpStatus}`))
          }
        })
        .catch((ex) => { /* no-op */ })
    } else {
      const id = uuid.v4()
      this[privPlatform].queue.set(id, {
        webContents: transportWebContents.id,
        url: url,
        id: id,
        ts: new Date().getTime()
      })

      return new Promise((resolve, reject) => {
        let timeout
        let handler

        timeout = setTimeout(() => {
          transportWebContents.session.removeListener('will-download', handler)
          this[privPlatform].queue.delete(id)
          reject(new Error('Timeout'))
        }, MAX_PLATFORM_START_TIME)

        handler = (evt, item, wc) => {
          // Check
          const downloadId = this._getPlatformDownloadId(item, wc)
          if (downloadId === undefined) { return }

          // Dequeue
          this[privPlatform].queue.delete(downloadId)
          transportWebContents.session.removeListener('will-download', handler)
          clearTimeout(timeout)

          // Get save path
          let actualSavePath = downloadPath
          if (path.extname(downloadPath) !== path.extname(item.getFilename())) {
            actualSavePath = downloadPath + path.extname(item.getFilename())
          }
          item.setSavePath(actualSavePath)

          // Bind listeners
          item.once('done', (doneEvt, state) => {
            if (state === 'completed') {
              resolve(actualSavePath)
            } else {
              reject(new Error(`Download failed: ${state}`))
            }
          })
        }
        transportWebContents.session.on('will-download', handler)
        transportWebContents.downloadURL(url)
      })
    }
  }

  /**
  * Checks to see if this is a platform download
  * @param item: the download item
  * @param wc: the webcontents that triggered the vent
  * @return true if this is a platform download
  */
  _isPlatformDownload (item, webContents) {
    return this._getPlatformDownloadId(item, webContents) !== undefined
  }

  /**
  * Gets the id of the platform download
  * @param item: the download item
  * @param wc: the webcontents that triggered the vent
  * @return the download id if it is a platform download, undefined otherwise
  */
  _getPlatformDownloadId (item, webContents) {
    const platformDownload = Array.from(this[privPlatform].queue.values()).find((platformItem) => {
      if (platformItem.webContents === webContents.id && platformItem.url === item.getURLChain()[0]) {
        return true
      } else {
        return false
      }
    })
    return platformDownload ? platformDownload.id : undefined
  }
}

export default new DownloadManager()
