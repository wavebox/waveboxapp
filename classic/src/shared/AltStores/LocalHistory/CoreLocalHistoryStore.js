import RemoteStore from '../RemoteStore'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltLocalHistoryIdentifiers'
import Download from '../../Models/LocalHistory/Download'
import electron from 'electron'
import path from 'path'
import fs from 'fs'
import { WB_DOWNLOAD_CANCEL_RUNNING } from '../../ipcEvents'

const MAX_NOTIFICATION_HISTORY = 100

class CoreLocalHistoryStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)

    this.notifications = []
    this._downloads_ = {
      active: new Map(),
      inactive: new Map()
    }

    /* ****************************************/
    // Downloads
    /* ****************************************/

    /**
    * @param id: the id of the download
    * @return the download from the downloads list
    */
    this.getDownload = (id) => {
      return this._downloads_.active.get(id) || this._downloads_.inactive.get(id)
    }

    /**
    * @param descending=false: set to true to make them descending
    * @return a list of downloads ordered by modified time
    */
    this.getDownloadsOrdered = (descending = false) => {
      const ordered = [].concat(
        Array.from(this._downloads_.active.values()),
        Array.from(this._downloads_.inactive.values())
      ).sort((a, b) => {
        if (a.state === Download.STATES.ACTIVE && b.state === Download.STATES.ACTIVE) {
          return a.createdTime - b.createdTime
        } else if (a.state === Download.STATES.ACTIVE) {
          return 1
        } else if (b.state === Download.STATES.ACTIVE) {
          return -1
        } else {
          return a.changedTime - b.changedTime
        }
      })
      return descending ? ordered.reverse() : ordered
    }

    /**
    * @return true if there are active downloads
    */
    this.hasActiveDownloads = () => {
      return this._downloads_.active.size !== 0
    }

    /**
    * @return the number of active downloads
    */
    this.getActiveDownloadCount = () => {
      return this._downloads_.active.size
    }

    /**
    * @return the total download percentage for active downloads
    */
    this.getActiveDownloadPercent = () => {
      if (this._downloads_.active.size === 0) { return 100 }
      const totalPercent = Array.from(this._downloads_.active.values()).reduce((acc, dl) => {
        return acc + dl.bytesPercent
      }, 0)
      return totalPercent / this._downloads_.active.size
    }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD,
      handleAddNotification: actions.ADD_NOTIFICATION,
      handleClearAllNotifications: actions.CLEAR_ALL_NOTIFICATIONS,
      handleShowDownloadInFolder: actions.SHOW_DOWNLOAD_IN_FOLDER,
      handleCancelActiveDownload: actions.CANCEL_ACTIVE_DOWNLOAD
    })
  }

  /* **************************************************************************/
  // Lifecycle handlers
  /* **************************************************************************/

  handleLoad ({ notifications, downloads, downloadsActive }) {
    this.notifications = notifications
    this._downloads_.inactive = Object.keys(downloads).reduce((acc, k) => {
      acc.set(k, new Download(downloads[k]))
      return acc
    }, new Map())
    this._downloads_.active = Object.keys(downloadsActive).reduce((acc, k) => {
      acc.set(k, new Download(downloadsActive[k]))
      return acc
    }, new Map())

    this.__isStoreLoaded__ = true
  }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  handleAddNotification ({ notification, timestamp, id }) {
    this.notifications = [{ notification, timestamp, id }]
      .concat(this.notifications)
      .slice(0, MAX_NOTIFICATION_HISTORY)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  handleClearAllNotifications () {
    this.notifications = []
  }

  /* **************************************************************************/
  // Downloads
  /* **************************************************************************/

  handleShowDownloadInFolder ({ id }) {
    this.preventDefault() // Changes are by side-effect

    const download = this.getDownload(id)
    if (!download) { return }

    const shell = process.type === 'renderer' ? electron.remote.shell : electron.shell
    const didShow = shell.showItemInFolder(download.downloadPath)
    if (!didShow) {
      const directory = path.dirname(download.downloadPath)
      try {
        if (fs.lstatSync(directory).isDirectory()) {
          shell.openItem(directory)
        }
      } catch (ex) { /* no-op */ }
    }
  }

  handleCancelActiveDownload ({ id }) {
    this.preventDefault() // Changes are by side-effect

    const download = this.getDownload(id)
    if (!download || !download.state === Download.STATES.ACTIVE) { return }

    if (process.type === 'renderer') {
      electron.ipcRenderer.send(WB_DOWNLOAD_CANCEL_RUNNING, id)
    } else {
      electron.ipcMain.send(WB_DOWNLOAD_CANCEL_RUNNING, id)
    }
  }
}

export default CoreLocalHistoryStore
