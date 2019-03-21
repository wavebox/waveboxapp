import electron, { ipcMain, webContents, app } from 'electron'
import { EventEmitter } from 'events'
import {
  WB_GET_POWER_MONITOR_STATE_SYNC,
  WB_POWER_MONITOR_CONNECT_EVENTS,
  WB_POWER_MONITOR_DISCONNECT_EVENTS,
  WB_POWER_MONITOR_EVENT,
  WB_POWER_MONITOR_QUERY_IDLE_TIME
} from 'shared/ipcEvents'

const privSuspended = Symbol('privSuspended')
const privScreenLocked = Symbol('privScreenLocked')
const privConnectedRemote = Symbol('privConnectedRemote')

class PowerMonitorService extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    this[privSuspended] = false
    this[privScreenLocked] = false
    this[privConnectedRemote] = new Set()

    app.whenReady().then(() => {
      electron.powerMonitor.on('suspend', this._handleSuspend)
      electron.powerMonitor.on('resume', this._handleResume)
      electron.powerMonitor.on('lock-screen', this._handleScreenLock)
      electron.powerMonitor.on('unlock-screen', this._handleScreenUnlock)
    })

    ipcMain.on(WB_GET_POWER_MONITOR_STATE_SYNC, this._handleIpcGetStateSync)
    ipcMain.on(WB_POWER_MONITOR_CONNECT_EVENTS, this._handleIpcConnectEvents)
    ipcMain.on(WB_POWER_MONITOR_DISCONNECT_EVENTS, this._handleIpcDisconnectEvents)
    ipcMain.on(WB_POWER_MONITOR_QUERY_IDLE_TIME, this._handleIpcQueryIdleTime)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isSuspended () { return this[privSuspended] }
  get isScreenLocked () { return this[privScreenLocked] }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * Generates the state for the ipc bridge
  * @return the state
  */
  _generateIPCState () {
    return {
      isSuspended: this.isSuspended,
      isScreenLocked: this.isScreenLocked
    }
  }

  /**
  * Re-pushes the event to self and the ipc bridge
  * @param name: the event name
  */
  _repushEvent (name) {
    this.emit(name, { sender: this })

    const ipcState = this._generateIPCState()
    this[privConnectedRemote].forEach((wcId) => {
      const wc = webContents.fromId(wcId)
      if (!wc || wc.isDestroyed()) { return }
      wc.send(`${WB_POWER_MONITOR_EVENT}`, name, ipcState)
    })
  }

  /* ****************************************************************************/
  // Event handlers: Power
  /* ****************************************************************************/

  /**
  * Records that the system is going for suspend
  */
  _handleSuspend = () => {
    this[privSuspended] = true
    this._repushEvent('suspend')
  }

  /**
  * Records that the system is coming up in resume
  */
  _handleResume = () => {
    this[privSuspended] = false
    this._repushEvent('resume')
  }

  /**
  * Records the screen locked
  */
  _handleScreenLock = () => {
    this[privScreenLocked] = true
    this._repushEvent('lock-screen')
  }

  /**
  * Records the screen unlocked
  */
  _handleScreenUnlock = () => {
    this[privScreenLocked] = false
    this._repushEvent('unlock-screen')
  }

  /* ****************************************************************************/
  // Event handlers: IPC
  /* ****************************************************************************/

  /**
  * Handles the ipc channel fetching the current state sync
  * @param evt: the event that fired
  */
  _handleIpcGetStateSync = (evt) => {
    try {
      evt.returnValue = this._generateIPCState()
    } catch (ex) {
      console.error(`Failed to respond to "${WB_GET_POWER_MONITOR_STATE_SYNC}" continuing with unknown side effects`, ex)
      evt.returnValue = null
    }
  }

  /**
  * Handles the ipc channel connecting
  * @param evt: the event that fired
  */
  _handleIpcConnectEvents = (evt) => {
    const webContentsId = evt.sender.id
    if (this[privConnectedRemote].has(webContentsId)) { return }

    this[privConnectedRemote].add(webContentsId)
    evt.sender.on('destroyed', () => this[privConnectedRemote].delete(webContentsId))
  }

  /**
  * Handles the ipc channel disconnecting
  * @param evt: the event that fired
  */
  _handleIpcDisconnectEvents = (evt) => {
    this[privConnectedRemote].delete(evt.sender.webContentsId)
  }

  /**
  * Handles the ipc channel asking for the idle time
  * @param evt: the event that fired
  * @param returnChannel: the return channel to send the response
  */
  _handleIpcQueryIdleTime = (evt, returnChannel) => {
    electron.powerMonitor.querySystemIdleTime((idleTime) => {
      if (evt.sender.isDestroyed()) { return }
      evt.sender.send(returnChannel, idleTime)
    })
  }
}

export default PowerMonitorService
