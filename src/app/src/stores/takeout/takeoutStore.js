import alt from '../alt'
import actions from './takeoutActions'
import fs from 'fs'
import path from 'path'
import settingsStore from '../settings/settingsStore'
import mailboxStore from '../mailbox/mailboxStore'
import pkg from 'package.json'
import RuntimePaths from 'Runtime/RuntimePaths'
import { dialog } from 'electron'
import WaveboxWindow from 'windows/WaveboxWindow'
import {evtMain} from 'AppEvents'

class TakeoutStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    /**
    * Exports the data
    * @return a plain json-able object that can be re-imported
    */
    this.exportData = () => {
      return {
        version: pkg.version,
        stores: {
          //'mailboxes_db.json': mailboxStore.getState().exportMailboxDataSync(),
          //'avatar_db.json': mailboxStore.getState().exportAvatarDataSync(),
          //'settings_db.json': settingsStore.getState().exportDataSync()
        }
      }
    }

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
    const focused = WaveboxWindow.focused()
    const now = new Date()
    dialog.showSaveDialog(focused ? focused.window : undefined, {
      title: 'Wavebox Export',
      defaultPath: `wavebox_export_${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}_${now.getHours()}_${now.getMinutes()}.waveboxdata`,
      buttonLabel: 'Export'
    }, (filename) => {
      if (!filename) { return }
      const data = JSON.stringify(this.exportData())
      fs.writeFile(filename, data, () => { /* no-op */ })
    })
  }

  handleImportDataFromDisk () {
    this.preventDefault()

    //TODO
    const shouldImport = window.confirm([
      'Importing accounts and settings will remove any configuration you have done on this machine.',
      '',
      'Are you sure you want to do this?'
    ].join('\n'))


    const focused = WaveboxWindow.focused()
    dialog.showOpenDialog(focused ? focused.window : undefined, {
      title: 'Wavebox Import',
      buttonLabel: 'Import',
      properties: ['openFile']
    }, (filenames) => {
      if (!filenames || !filenames.length) { return }
      const filename = filenames[0]
      if (!filename) { return }

      fs.readFile(filename, 'utf8', (err, rawData) => {
        if (err) {
          dialog.showMessageBox(focused ? focused.window : undefined, {
            type: 'error',
            message: 'Unable to load file'
          })
          return
        }

        let data
        try {
          data = JSON.parse(rawData)
        } catch (ex) {
          dialog.showMessageBox(focused ? focused.window : undefined, {
            type: 'error',
            message: 'Invalid file format'
          })
          return
        }

        Object.keys(data.stores).forEach((name) => {
          // Skip filenames with \ or / in the name
          if (name.indexOf('/') !== -1 || name.indexOf('\\') !== -1) { return }
          const writePath = path.join(RuntimePaths.DB_DIR_PATH, `${name}.import`)
          const writeData = JSON.stringify(data.stores[name])
          fs.writeFileSync(writePath, writeData)
        })

        evtMain.emit(evtMain.WB_RELAUNCH_APP, { })
      })
    })
  }
}

export default alt.createStore(TakeoutStore, 'TakeoutStore')
