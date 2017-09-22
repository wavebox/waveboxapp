import alt from '../alt'
import { WB_SUBMIT_PROCESS_RESOURCE_USAGE } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

class MonitorActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * Basically a no-op but ensures that the ipcRenderer events are bound
  */
  load () { return {} }

  /* **************************************************************************/
  // Syncers
  /* **************************************************************************/

  /**
  * Resyncs the process list
  */
  resyncProcesses () { return {} }

  /**
  * Submits the process resource usage
  * @param info: the info to submit
  */
  submitProcessResourceUsage (info) { return { info: info } }
}

const actions = alt.createActions(MonitorActions)
ipcRenderer.on(WB_SUBMIT_PROCESS_RESOURCE_USAGE, (evt, body) => actions.submitProcessResourceUsage(body))
export default actions
