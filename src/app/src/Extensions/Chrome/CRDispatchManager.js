import { ipcMain } from 'electron'
import IPCDispatcher from 'shared/Electron/IPCDispatcher'
export default new IPCDispatcher(ipcMain)
