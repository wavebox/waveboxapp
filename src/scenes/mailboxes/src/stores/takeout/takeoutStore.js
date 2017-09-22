import alt from '../alt'
import actions from './takeoutActions'
import fs from 'fs'
import path from 'path'
import settingsStore from 'stores/settings/settingsStore'
import mailboxStore from 'stores/mailbox/mailboxStore'
import { WB_RELAUNCH_APP } from 'shared/ipcEvents'
import { remote, ipcRenderer } from 'electron'
import pkg from 'package.json'

const { dialog } = remote
const { DB_DIR_PATH } = window.mprocManager('PathManager')

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
          'mailboxes_db.json': mailboxStore.getState().exportMailboxDataSync(),
          'avatar_db.json': mailboxStore.getState().exportAvatarDataSync(),
          'settings_db.json': settingsStore.getState().exportDataSync()
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
    const now = new Date()
    dialog.showSaveDialog(remote.getCurrentWindow(), {
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
    dialog.showOpenDialog(remote.getCurrentWindow(), {
      title: 'Wavebox Import',
      buttonLabel: 'Import',
      properties: ['openFile']
    }, (filenames) => {
      if (!filenames || !filenames.length) { return }
      const filename = filenames[0]
      if (!filename) { return }

      fs.readFile(filename, 'utf8', (err, rawData) => {
        if (err) {
          window.alert('Unable to load file')
          return
        }

        let data
        try {
          data = JSON.parse(rawData)
        } catch (ex) {
          window.alert('Invalid file format')
          return
        }

        Object.keys(data.stores).forEach((name) => {
          // Skip filenames with \ or / in the name
          if (name.indexOf('/') !== -1 || name.indexOf('\\') !== -1) { return }
          const writePath = path.join(DB_DIR_PATH, `${name}.import`)
          const writeData = JSON.stringify(data.stores[name])
          fs.writeFileSync(writePath, writeData)
        })

        ipcRenderer.send(WB_RELAUNCH_APP, { })
      })
    })
  }
}

export default alt.createStore(TakeoutStore, 'TakeoutStore')
