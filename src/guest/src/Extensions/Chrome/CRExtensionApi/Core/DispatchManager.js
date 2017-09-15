const req = require('../../../../req')
const { ipcRenderer } = require('electron')
const IPCDispatcher = req.shared('Electron/IPCDispatcher.js')

module.exports = new IPCDispatcher(ipcRenderer, ipcRenderer)
