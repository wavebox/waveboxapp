const { ipcRenderer } = require('electron')
const req = require('./req')
const IPCDispatcher = req.shared('Electron/IPCDispatcher')
module.exports = new IPCDispatcher(ipcRenderer, ipcRenderer)
