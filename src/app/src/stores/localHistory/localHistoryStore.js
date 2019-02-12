import alt from '../alt'
import CoreLocalHistoryStore from 'shared/AltStores/LocalHistory/CoreLocalHistoryStore'
import { STORE_NAME } from 'shared/AltStores/LocalHistory/AltLocalHistoryIdentifiers'
import actions from './localHistoryActions'  // eslint-disable-line
import persistence from 'Storage/localHistoryStorage'
import Download from 'shared/Models/LocalHistory/Download'

const MAX_DOWNLOAD_HISTORY = 100

class LocalHistoryStore extends CoreLocalHistoryStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    /* ****************************************/
    // Actions
    /* ****************************************/

    this.bindActions({
      handleDownloadStarted: actions.DOWNLOAD_STARTED,
      handleDownloadUpdated: actions.DOWNLOAD_UPDATED,
      handleDownloadFinished: actions.DOWNLOAD_FINISHED,
      handleDownloadFailed: actions.DOWNLOAD_FAILED,
      handleClearAllDownloads: actions.CLEAR_ALL_DOWNLOADS,
      handleDeleteDownload: actions.DELETE_DOWNLOAD
    })
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Overwrite
  */
  _remoteConnectReturnValue () {
    return {
      notifications: this.notifications,
      downloads: Array.from(this._downloads_.inactive.entries()).reduce((a, [k, v]) => {
        a[k] = v.cloneData(); return a
      }, {}),
      downloadsActive: Array.from(this._downloads_.active.entries()).reduce((a, [k, v]) => {
        a[k] = v.cloneData(); return a
      }, {})
    }
  }

  /* **************************************************************************/
  // Saving
  /* **************************************************************************/

  /**
  * Saves a download
  * @param id: the id of the provider
  * @param downloadJS: the new js object for the download or null to remove
  * @return the generated model
  */
  saveInactiveDownload (id, downloadJS) {
    let download
    if (downloadJS === null) {
      this._downloads_.inactive.delete(id)
      this.dispatchToRemote('remoteSetInactiveDownload', [id, null, []])
    } else {
      download = new Download(downloadJS)
      this._downloads_.inactive.set(id, download)
      if (this._downloads_.inactive.size > MAX_DOWNLOAD_HISTORY) {
        const sorted = Array.from(this._downloads_.inactive.entries())
          .sort(([aKey, aDl], [bKey, bDl]) => bDl.createdTime - aDl.createdTime)
        this._downloads_.inactive = new Map(sorted.slice(0, MAX_DOWNLOAD_HISTORY))
        const remove = sorted.slice(MAX_DOWNLOAD_HISTORY).map(([k, dl]) => k)
        this.dispatchToRemote('remoteSetInactiveDownload', [id, downloadJS, remove])
      } else {
        this.dispatchToRemote('remoteSetInactiveDownload', [id, downloadJS, []])
      }
    }

    persistence.setJSONItem('downloads', Array.from(this._downloads_.inactive.keys()).reduce((acc, id) => {
      acc[id] = this._downloads_.inactive.get(id).cloneData()
      return acc
    }, {}))
    return download
  }

  /**
  * Saves an active download
  * @param id: the id of the provider
  * @param downloadJS: the new js object for the download or null to remove
  * @return the generated model
  */
  saveActiveDownload (id, downloadJS) {
    let download
    if (downloadJS === null) {
      this._downloads_.active.delete(id)
      this.dispatchToRemote('remoteSetActiveDownload', [id, null])
    } else {
      download = new Download(downloadJS)
      this._downloads_.active.set(id, download)
      this.dispatchToRemote('remoteSetActiveDownload', [id, downloadJS])
    }
    return download
  }

  /**
  * Does a batch clear on inactive downloads
  */
  clearAllInactiveDownloads () {
    const keys = Array.from(this._downloads_.inactive.keys())
    this._downloads_.inactive.clear()
    persistence.setJSONItem('downloads', {})
    this.dispatchToRemote('remoteSetInactiveDownload', [null, null, keys])
  }

  /* **************************************************************************/
  // Handlers: Notifications
  /* **************************************************************************/

  handleAddNotification (payload) {
    super.handleAddNotification(payload)
    persistence.setJSONItem('notifications', this.notifications)
    this.dispatchToUniversalRemote('addNotification', [payload.notification, payload.timestamp, payload.id])
  }

  handleClearAllNotifications () {
    super.handleClearAllNotifications()
    persistence.setJSONItem('notifications', this.notifications)
    this.dispatchToUniversalRemote('clearAllNotifications', [])
  }

  /* **************************************************************************/
  // Handlers: Downloads
  /* **************************************************************************/

  handleDownloadStarted ({ id, download }) {
    this.saveActiveDownload(id, {
      ...download,
      id: id,
      createdTime: new Date().getTime(),
      state: Download.STATES.ACTIVE
    })
  }

  handleDownloadUpdated ({ id, download }) {
    const prev = this.getDownload(id)
    if (!prev || prev.state !== Download.STATES.ACTIVE) { this.preventDefault(); return }
    this.saveActiveDownload(id, prev.changeData({
      ...download,
      id: prev.id,
      changedTime: new Date().getTime()
    }))
  }

  handleDownloadFinished ({ id, download }) {
    const prev = this.getDownload(id)
    if (!prev) { this.preventDefault(); return }

    this.saveActiveDownload(id, null)
    this.saveInactiveDownload(id, prev.changeData({
      ...download,
      id: prev.id,
      changedTime: new Date().getTime(),
      state: Download.STATES.FINISHED
    }))
  }

  handleDownloadFailed ({ id, download }) {
    const prev = this.getDownload(id)
    if (!prev) { this.preventDefault(); return }

    this.saveActiveDownload(id, null)
    this.saveInactiveDownload(id, prev.changeData({
      ...download,
      id: prev.id,
      changedTime: new Date().getTime(),
      state: Download.STATES.FAILED
    }))
  }

  handleClearAllDownloads () {
    this.clearAllInactiveDownloads()
  }

  handleDeleteDownload ({ id }) {
    this.saveInactiveDownload(id, null)
  }
}

export default alt.createStore(LocalHistoryStore, STORE_NAME)
