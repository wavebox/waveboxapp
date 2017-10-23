import { ipcRenderer } from 'electron'
import IPCDispatcher from 'shared/Electron/IPCDispatcher.js'

export default new IPCDispatcher(ipcRenderer, ipcRenderer)
