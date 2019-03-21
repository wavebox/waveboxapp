import { ipcRenderer } from 'electron'
import { EventEmitter } from 'events'
import {
  WB_GET_POWER_MONITOR_STATE_SYNC,
  WB_POWER_MONITOR_CONNECT_EVENTS,
  WB_POWER_MONITOR_EVENT,
  WB_POWER_MONITOR_QUERY_IDLE_TIME
} from './ipcEvents'
import uuid from 'uuid'

const privState = Symbol('privState')
const privConnected = Symbol('privConnected')

class PowerMonitorService extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this[privState] = undefined
    this[privConnected] = false
  }

  /**
  * Ensures the ipc is open and connected
  * @return this
  */
  _ensureConnected () {
    if (!this[privConnected]) {
      ipcRenderer.send(WB_POWER_MONITOR_CONNECT_EVENTS)
      ipcRenderer.on(WB_POWER_MONITOR_EVENT, this._handlePowerMonitorEvent)
      this[privState] = ipcRenderer.sendSync(WB_GET_POWER_MONITOR_STATE_SYNC)
      this[privConnected] = true
    }
    return this
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isSuspended () { return this._ensureConnected()[privState].isSuspended }
  get isScreenLocked () { return this._ensureConnected()[privState].isScreenLocked }

  /* **************************************************************************/
  // Querying
  /* **************************************************************************/

  /**
  * Gets the current system idle time
  * @return promise
  */
  querySystemIdleTime () {
    return new Promise((resolve, reject) => {
      let timeout = null
      const returnChannel = `${WB_POWER_MONITOR_QUERY_IDLE_TIME}_${uuid.v4()}`
      const returnFn = (evt, idleTime) => {
        clearTimeout(timeout)
        resolve(idleTime)
      }
      timeout = setTimeout(() => {
        ipcRenderer.removeListener(returnChannel, returnFn)
        reject(new Error('Timeout'))
      }, 1000)
      ipcRenderer.once(returnChannel, returnFn)
      ipcRenderer.send(WB_POWER_MONITOR_QUERY_IDLE_TIME, returnChannel)
    })
  }

  /* **************************************************************************/
  // ipc events
  /* **************************************************************************/

  /**
  * Handles a power monitor event by repropogating
  * @param evt: the event that fired
  * @param evtName: the name of the event
  * @param state: the new state
  */
  _handlePowerMonitorEvent = (evt, evtName, state) => {
    this[privState] = state
    this.emit(evtName)
  }

  /* **************************************************************************/
  // Event emitter
  /* **************************************************************************/

  on (...args) {
    this._ensureConnected()
    return super.on(...args)
  }

  once (...args) {
    this._ensureConnected()
    return super.once(...args)
  }

  addListener (...args) {
    this._ensureConnected()
    return super.addListener(...args)
  }
}

export default new PowerMonitorService()
