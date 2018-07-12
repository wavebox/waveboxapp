import acmailboxStorage from 'Storage/acmailboxStorage'
import acserviceStorage from 'Storage/acserviceStorage'
import avatarStorage from 'Storage/avatarStorage'
import settingStorage from 'Storage/settingStorage'
import mailboxStorage from 'Storage/mailboxStorage'
import pkg from 'package.json'
import { dialog, ipcMain } from 'electron'
import fs from 'fs-extra'
import WaveboxWindow from 'Windows/WaveboxWindow'
import { evtMain } from 'AppEvents'
import MachineInfo from 'shared/MachineInfo'
import { userStore } from 'stores/user'
import {
  WB_TAKEOUT_IMPORT_FILE,
  WB_TAKEOUT_EXPORT_FILE,
  WB_TAKEOUT_EXPORT_SERVER,
  WB_TAKEOUT_EXPORT_SERVER_CHANGESET,
  WB_TAKEOUT_IMPORT_SERVER
} from 'shared/ipcEvents'

const TAKEOUT_STORES = [
  acmailboxStorage,
  acserviceStorage,
  avatarStorage,
  settingStorage
]
const MIGRATED_DISK_TAKEOUT_STORES = [
  mailboxStorage // in 3.14.7 and below. Before server sync
]

const TAKEOUT_STORES_INDEX = TAKEOUT_STORES.reduce((acc, store) => {
  acc.set(store.exportName, store)
  return acc
}, new Map())

class TakeoutService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_TAKEOUT_IMPORT_FILE, this._handleIPCImportDataFromDisk)
    ipcMain.on(WB_TAKEOUT_EXPORT_FILE, this._handleIPCExportDataToDisk)
    ipcMain.on(WB_TAKEOUT_EXPORT_SERVER, this._handleIPCExportDataForServer)
    ipcMain.on(WB_TAKEOUT_EXPORT_SERVER_CHANGESET, this._handleIPCExportDataChangesetForServer)
    ipcMain.on(WB_TAKEOUT_IMPORT_SERVER, this._handleIPCImportDataFromServer)
  }

  /* ****************************************************************************/
  // Data prep
  /* ****************************************************************************/

  /**
  * Prepares the data for export to disk
  * @return a string which can be saved
  */
  _dataForDiskExport () {
    const storeData = TAKEOUT_STORES.reduce((acc, storage) => {
      const {name, data} = storage.getExportData()
      acc[name] = data
      return acc
    }, {})
    const data = JSON.stringify({
      version: pkg.version,
      stores: storeData
    })
    return data
  }

  /**
  * Prepares the data for export to the server
  * @return a json object which can be exported
  */
  _dataForServerExport () {
    const storeData = TAKEOUT_STORES.reduce((acc, storage) => {
      try {
        const {name, data} = storage.getExportChangesetManifest()
        acc[name] = data
      } catch (ex) {
        if (ex.notImplemented) {
          const {name, data} = storage.getExportData()
          acc[name] = data
        } else {
          throw ex
        }
      }
      return acc
    }, {})

    return {
      id: userStore.getState().clientId,
      timestamp: new Date().getTime(),
      machine: {
        name: MachineInfo.humanizedName,
        platform: process.platform,
        arch: process.arch,
        app: pkg.version
      },
      data: storeData
    }
  }

  /**
  * Prepares the keyset data for server export
  * @param manifest: the manifest defining which keys to export. Manifest should be in the format...
  *                   {storage_name: [key1, key2]}
  * @return the export
  */
  _changesetForServerExport (manifest) {
    return Object.keys(manifest).reduce((acc, storageName) => {
      if (TAKEOUT_STORES_INDEX.has(storageName)) {
        try {
          acc[storageName] = TAKEOUT_STORES_INDEX.get(storageName).getExportChangeset(manifest[storageName])
        } catch (ex) {
          if (ex.notImplemented) {
            acc[storageName] = {}
          } else {
            throw ex
          }
        }
      } else {
        acc[storageName] = {}
      }
      return acc
    }, {})
  }

  /* ****************************************************************************/
  // Handlers: Disk
  /* ****************************************************************************/

  /**
  * Handles an ipc request to export to disk
  * @param evt: the event that fired
  */
  _handleIPCExportDataToDisk = (evt) => {
    const waveboxWindow = WaveboxWindow.focused()
    const browserWindow = waveboxWindow ? waveboxWindow.window : undefined

    const now = new Date()
    const filename = `wavebox_export_${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}_${now.getHours()}_${now.getMinutes()}.waveboxdata`
    Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          dialog.showSaveDialog(browserWindow, {
            title: 'Wavebox Export',
            defaultPath: filename,
            buttonLabel: 'Export'
          }, (filepath) => {
            if (filepath) {
              resolve(filepath)
            } else {
              reject(new Error('User Cancelled'))
            }
          })
        })
      })
      .then((filepath) => fs.writeFile(filepath, this._dataForDiskExport()))
      .catch((err) => {
        if (err.message.startsWith('User')) { return }

        console.error(err)
        dialog.showMessageBox(browserWindow, {
          type: 'error',
          message: 'Failed to export',
          buttons: ['OK']
        }, () => { /* no-op */ })
      })
  }

  /**
  * Handles an ipc request to import from disk
  * @param evt: the event that was fired
  */
  _handleIPCImportDataFromDisk = (evt) => {
    const waveboxWindow = WaveboxWindow.focused()
    const browserWindow = waveboxWindow ? waveboxWindow.window : undefined

    Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          dialog.showMessageBox(browserWindow, {
            type: 'question',
            message: [
              'Importing accounts and settings will remove any configuration you have done on this machine.',
              '',
              'Are you sure you want to do this?'
            ].join('\n'),
            buttons: ['Cancel', 'Continue']
          }, (res) => {
            if (res === 0) {
              reject(new Error('User Cancelled'))
            } else {
              resolve()
            }
          })
        })
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          dialog.showOpenDialog(browserWindow, {
            title: 'Wavebox Import',
            buttonLabel: 'Import',
            properties: ['openFile']
          }, (filepaths) => {
            if (filepaths && filepaths[0]) {
              resolve(filepaths[0])
            } else {
              reject(new Error('User Cancelled'))
            }
          })
        })
      })
      .then((filepath) => fs.readFile(filepath, 'utf8'))
      .then((rawData) => JSON.parse(rawData))
      .then((data) => {
        TAKEOUT_STORES.forEach((storage) => {
          if (data.stores[storage.exportName]) {
            storage.writeImportDataSync(data.stores[storage.exportName])
          }
        })
        MIGRATED_DISK_TAKEOUT_STORES.forEach((storage) => {
          if (data.stores[storage.exportName]) {
            storage.writeImportDataSync(data.stores[storage.exportName])
          }
        })
        setTimeout(() => {
          evtMain.emit(evtMain.WB_RELAUNCH_APP, { })
        }, 500)
      })
      .catch((err) => {
        if (err.message.startsWith('User')) { return }

        console.error(err)
        dialog.showMessageBox(browserWindow, {
          type: 'error',
          message: 'Failed to import',
          buttons: ['OK']
        }, () => { /* no-op */ })
      })
  }

  /* ****************************************************************************/
  // Handlers: Server
  /* ****************************************************************************/

  /**
  * Handles a request to get the server export data
  * @param evt: the event that was fired
  * @param responseChannel: the channel to respond on
  */
  _handleIPCExportDataForServer = (evt, responseChannel) => {
    const data = this._dataForServerExport()
    if (evt.sender.isDestroyed()) { return }
    evt.sender.send(responseChannel, data)
  }

  /**
  * Handles a request to get the server export data for a keyset
  * @param evt: the event that was fired
  * @param manifest: the manifest to pass to the fn
  * @param responseChannel: the channel to respond on
  */
  _handleIPCExportDataChangesetForServer = (evt, manifest, responseChannel) => {
    const data = this._changesetForServerExport(manifest)
    if (evt.sender.isDestroyed()) { return }
    evt.sender.send(responseChannel, data)
  }

  /**
  * Handles importing settings from the server
  * @param evt: the event that was fired
  * @param data: the data to import
  */
  _handleIPCImportDataFromServer = (evt, data) => {
    const waveboxWindow = WaveboxWindow.focused()
    const browserWindow = waveboxWindow ? waveboxWindow.window : undefined

    Promise.resolve()
      .then((data) => {
        TAKEOUT_STORES.forEach((storage) => {
          if (data.stores[storage.exportName]) {
            storage.writeImportDataSync(data.stores[storage.exportName])
          }
        })
        setTimeout(() => {
          evtMain.emit(evtMain.WB_RELAUNCH_APP, { })
        }, 500)
      })
      .catch((err) => {
        console.error(err)
        dialog.showMessageBox(browserWindow, {
          type: 'error',
          message: 'Failed to import',
          buttons: ['OK']
        }, () => { /* no-op */ })
      })
  }
}

export default TakeoutService
