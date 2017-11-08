import alt from '../alt'
import { ipcRenderer, remote } from 'electron'
import {
  WB_COLLECTED_METRICS,
  WB_START_CONNECTION_REPORTER,
  WB_COLLECT_CONNECTION_METRICS
} from 'shared/ipcEvents'

class MonitorActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * Basically a no-op but ensures that the ipcRenderer events are bound
  */
  load () {
    const returnId = remote.getCurrentWebContents().id
    remote.webContents.getAllWebContents().forEach((wc) => {
      wc.send(WB_START_CONNECTION_REPORTER, returnId)
    })
    return {}
  }

  /* **************************************************************************/
  // Syncers
  /* **************************************************************************/

  /**
  * Updates the metrics
  * @param metrics: the metric info
  */
  updateMetrics (metrics) { return { metrics } }

  /**
  * Updates the connection metrics
  * @param metrics: the metric info
  */
  updateConnectionMetrics (metrics) { return { metrics } }
}

const actions = alt.createActions(MonitorActions)
ipcRenderer.on(WB_COLLECTED_METRICS, (evt, { metrics }) => actions.updateMetrics(metrics))
ipcRenderer.on(WB_COLLECT_CONNECTION_METRICS, (evt, metrics) => actions.updateConnectionMetrics(metrics))
export default actions
