import alt from '../alt'
const { ipcRenderer } = window.nativeRequire('electron')

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
ipcRenderer.on('submit-process-resource-usage', (evt, body) => actions.submitProcessResourceUsage(body))
export default actions
