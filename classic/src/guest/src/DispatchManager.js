import { ipcRenderer } from 'electron'
import IPCDispatcher from 'shared/Electron/IPCDispatcher'
export default new IPCDispatcher(ipcRenderer, ipcRenderer)
