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
      return Array.from(this.connectionMetrics.values()).reduce((acc, {pid, connections}) => {
        const saltedConnections = connections.map((conn) => {
          return {...conn, pid}
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

  handleUpdateMetrics ({ metrics, system }) {
    this.metrics.clear()
    metrics.forEach((metric) => {
      if (metric.os) {
        this.metrics.set(metric.pid, metric)
      } else {
        // If we don't have OS metrics, scrape dummy values from the chromium ones
        this.metrics.set(metric.pid, {
          ...metric,
          os: {
            unreliable: true,
            cpu: metric.chromium.cpu.percentCPUUsage,
            memory: metric.chromium.memory.workingSetSize * 1024,
            ppid: -1,
            pid: metric.pid,
            ctime: -1,
            elapsed: -1,
            timestamp: -1
          }
        })
      }
    })
  }

  handleUpdateConnectionMetrics ({ metrics }) {
    this.connectionMetrics.set(metrics.pid, metrics)
  }
}

export default alt.createStore(MonitorStore, 'MonitorStore')
