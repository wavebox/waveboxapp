const { ipcMain } = require('electron')
const IPCDispatcher = require('../../../shared/Electron/IPCDispatcher')
module.exports = new IPCDispatcher(ipcMain)
