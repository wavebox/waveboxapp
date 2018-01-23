import alt from '../alt'
import actions from './takeoutActions'
import fs from 'fs'
import mailboxStorage from 'storage/mailboxStorage'
import avatarStorage from 'storage/avatarStorage'
import settingStorage from 'storage/settingStorage'
import pkg from 'package.json'
import { dialog } from 'electron'
import WaveboxWindow from 'windows/WaveboxWindow'
import {evtMain} from 'AppEvents'

const TAKEOUT_STORES = [
  mailboxStorage,
  avatarStorage,
  settingStorage
]

class TakeoutStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleExportDataToDisk: actions.EXPORT_DATA_TO_DISK,
      handleImportDataFromDisk: actions.IMPORT_DATA_FROM_DISK
    })
  }

  /* **************************************************************************/
  // Handlers: Export
  /* **************************************************************************/

  handleExportDataToDisk () {
    this.preventDefault()

    const waveboxWindow = WaveboxWindow.focused()
    const browserWindow = waveboxWindow ? waveboxWindow.window : undefined

    const now = new Date()
    const filename = `wavebox_export_${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}_${now.getHours()}_${now.getMinutes()}.waveboxdata`
    dialog.showSaveDialog(browserWindow, {
      title: 'Wavebox Export',
      defaultPath: filename,
      buttonLabel: 'Export'
    }, (filename) => {
      if (!filename) { return }

      const storeData = TAKEOUT_STORES.reduce((acc, storage) => {
        const {name, data} = storage.getExportDataSync()
        acc[name] = data
        return acc
      }, {})
      const data = JSON.stringify({
        version: pkg.version,
        stores: storeData
      })
      fs.writeFile(filename, data, () => { /* no-op */ })
    })
  }

  handleImportDataFromDisk () {
    this.preventDefault()

    const waveboxWindow = WaveboxWindow.focused()
    const browserWindow = waveboxWindow ? waveboxWindow.window : undefined

    dialog.showMessageBox(browserWindow, {
      type: 'question',
      message: [
        'Importing accounts and settings will remove any configuration you have done on this machine.',
        '',
        'Are you sure you want to do this?'
      ].join('\n'),
      buttons: ['Cancel', 'Continue']
    }, (res) => {
      if (res === 0) { return }

      dialog.showOpenDialog(browserWindow, {
        title: 'Wavebox Import',
        buttonLabel: 'Import',
        properties: ['openFile']
      }, (filenames) => {
        if (!filenames || !filenames.length) { return }
        const filename = filenames[0]
        if (!filename) { return }

        fs.readFile(filename, 'utf8', (err, rawData) => {
          if (err) {
            dialog.showMessageBox(browserWindow, {
              type: 'error',
              message: 'Unable to load file',
              buttons: ['OK']
            })
            return
          }

          let data
          try {
            data = JSON.parse(rawData)
          } catch (ex) {
            dialog.showMessageBox(browserWindow, {
              type: 'error',
              message: 'Invalid file format',
              buttons: ['OK']
            })
            return
          }

          TAKEOUT_STORES.forEach((storage) => {
            if (data.stores[storage.exportName]) {
              storage.writeImportDataSync(data.stores[storage.exportName])
            }
          })
          evtMain.emit(evtMain.WB_RELAUNCH_APP, { })
        })
      })
    })
  }
}

export default alt.createStore(TakeoutStore, 'TakeoutStore')
