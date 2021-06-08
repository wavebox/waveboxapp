import alt from '../alt'
import actions from './monitorActions'

class MonitorStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.metrics = new Map()
    this.connectionMetrics = new Map()

    /**
    * @return all the process metrics as an array
    */
    this.allProcessMetrics = () => {
      return Array.from(this.metrics.values())
    }

    /**
    * @return all the connection metrics as an array
    */
    this.allConnectionMetrics = () => {
      return Array.from(this.connectionMetrics.values()).reduce((acc, { pid, connections }) => {
        const saltedConnections = connections.map((conn) => {
          return { ...conn, pid }
        })
        return acc.concat(saltedConnections)
      }, [])
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleLoad: actions.LOAD,
      handleUpdateMetrics: actions.UPDATE_METRICS,
      handleUpdateConnectionMetrics: actions.UPDATE_CONNECTION_METRICS
    })
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  handleLoad () { /* no-op */ }

  handleUpdateMetrics ({ metrics }) {
    this.metrics.clear()
    metrics.forEach((metric) => {
      this.metrics.set(metric.pid, metric)
    })
  }

  handleUpdateConnectionMetrics ({ metrics }) {
    this.connectionMetrics.set(metrics.pid, metrics)
  }
}

export default alt.createStore(MonitorStore, 'MonitorStore')
