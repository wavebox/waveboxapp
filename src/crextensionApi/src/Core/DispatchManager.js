import { ipcRenderer } from 'electronCrx'
import IPCDispatcher from 'shared/Electron/IPCDispatcher.js'

export default new IPCDispatcher(ipcRenderer, ipcRenderer)
