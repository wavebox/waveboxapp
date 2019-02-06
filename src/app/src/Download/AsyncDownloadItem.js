import { EventEmitter } from 'events'
import uuid from 'uuid'
import path from 'path'
import { app } from 'electron'
import fs from 'fs-extra'

const privDownloadId = Symbol('privDownloadId')
const privDownloadItem = Symbol('privDownloadItem')
const privSavePath = Symbol('privSavePath')
const privDoneState = Symbol('privDoneState')
const privStartProperties = Symbol('privStartProperties')

class AsyncDownloadItem extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param downloadItem: the electron download item
  */
  constructor (downloadItem) {
    super()

    this[privDownloadId] = uuid.v4()
    this[privDownloadItem] = downloadItem
    this[privSavePath] = undefined
    this[privDoneState] = undefined

    // The downloadItem can be destroyed from under us. We need to keep the values
    // around, so the async API can query these as needed
    this[privStartProperties] = {
      url: downloadItem.getURL(),
      mimeType: downloadItem.getMimeType(),
      hasUserGesture: downloadItem.hasUserGesture(),
      filename: downloadItem.getFilename(),
      totalBytes: downloadItem.getTotalBytes(),
      contentDisposition: downloadItem.getContentDisposition(),
      urlChain: downloadItem.getURLChain(),
      lastModifiedTime: downloadItem.getLastModifiedTime(),
      etag: downloadItem.getETag(),
      startTime: downloadItem.getState()
    }

    downloadItem.on('updated', this._handleUpdated)
    downloadItem.on('done', this._handleDone)
    downloadItem.pause()
    downloadItem.setSavePath(this.tempDownloadLocation)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get downloadId () { return this[privDownloadId] }
  get tempDownloadLocation () { return path.join(app.getPath('temp'), `${this.downloadId}.tmp`) }
  get waitingSetup () { return !this[privSavePath] }

  /* ****************************************************************************/
  // Save path
  /* ****************************************************************************/

  setSavePath (p) {
    if (this[privDoneState]) {
      // This means we've completed already. Ensure we fire a fake done event
      this[privSavePath] = p
      this._handleDone({}, this[privDoneState])
    } else {
      if (this.waitingSetup) {
        this[privSavePath] = p
        fs.writeFileSync(p, '') // Indicate to the OS there's going to be a file here
        this[privDownloadItem].resume()
      }
    }
  }

  getSavePath () { return this[privSavePath] }

  /* ****************************************************************************/
  // Download resume / cancel
  /* ****************************************************************************/

  pause () {
    this[privDownloadItem].pause()
  }

  resume () {
    if (!this.waitingSetup) {
      this[privDownloadItem].resume()
    }
  }

  cancel () {
    fs.removeSync(this.tempDownloadLocation)
    if (!this[privDownloadItem].isDestroyed()) {
      this[privDownloadItem].cancel()
    }
  }

  isPaused () {
    return this.waitingSetup || this[privDownloadItem].isDestroyed()
      ? false
      : this[privDownloadItem].isPaused()
  }

  canResume () {
    return this[privDownloadItem].isDestroyed()
      ? false
      : this[privDownloadItem].canResume()
  }

  isFinished () {
    return this[privDoneState] !== undefined
  }

  finishedState () {
    return this[privDoneState]
  }

  isWaitingSetup () {
    return this.waitingSetup
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  getURL () { return this[privStartProperties].url }
  getMimeType () { return this[privStartProperties].mimeType }
  hasUserGesture () { return this[privStartProperties].hasUserGesture }
  getFilename () { return this[privStartProperties].filename }
  getTotalBytes () { return this[privStartProperties].totalBytes }
  getReceivedBytes () {
    return this[privDownloadItem].isDestroyed()
      ? this[privDoneState] === 'completed' ? this[privStartProperties].totalBytes : 0
      : this[privDownloadItem].getReceivedBytes()
  }
  getContentDisposition () { return this[privStartProperties].contentDisposition }
  getState () {
    return this.waitingSetup
      ? 'setup'
      : this[privDownloadItem].isDestroyed() ? this[privDoneState] : this[privDownloadItem].getState()
  }
  getURLChain () { return this[privStartProperties].urlChain }
  getLastModifiedTime () { return this[privStartProperties].lastModifiedTime }
  getETag () { return this[privStartProperties].etag }
  getStartTime () { return this[privStartProperties].getStartTime }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * @param evt: the event that fired
  * @param state: the current state
  */
  _handleUpdated = (evt, state) => {
    if (!this.waitingSetup) {
      this.emit('updated', evt, state)
    }
  }

  /**
  * @param evt: the event that fired
  * @param state: the current state
  */
  _handleDone = (evt, state) => {
    // Some items will complete immediately - e.g. blob items. For these
    // save the state and propogate out in setSavePath
    this[privDoneState] = state
    if (!this.waitingSetup) {
      if (state === 'completed') {
        fs.moveSync(this.tempDownloadLocation, this.getSavePath(), { overwrite: true })
      } else {
        try { fs.removeSync(this.tempDownloadLocation) } catch (ex) { /* no-op */ }
      }
      this.emit('done', evt, state)
    }
  }
}

export default AsyncDownloadItem
