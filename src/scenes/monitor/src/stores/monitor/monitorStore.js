import alt from '../alt'
import actions from './monitorActions'
const { remote } = window.nativeRequire('electron')

class MonitorStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.syncInterval = null
    this.processInfo = new Map()

    /**
    * @return the process info as an array
    */
    this.processInfoArray = () => {
      const arr = []
      this.processInfo.forEach((v) => arr.push(v))
      return arr
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleLoad: actions.LOAD,
      handleResyncProcesses: actions.RESYNC_PROCESSES,
      handleSubmitProcessResourceUsage: actions.SUBMIT_PROCESS_RESOURCE_USAGE
    })
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  handleLoad () {
    clearInterval(this.syncInterval)
    this.syncInterval = setInterval(() => {
      actions.resyncProcesses()
    }, 2000)
    actions.resyncProcesses.defer()
  }

  handleResyncProcesses () {
    const prevProcessInfo = this.processInfo
    const mainProcess = remote.process

    this.processInfo = remote.app.getAppMemoryInfo().reduce((acc, proc) => {
      if (proc.pid === process.pid) {
        acc.set(proc.pid, {
          ...proc.memory,
          ...process.getCPUUsage(),
          description: 'Monitor Window',
          pid: proc.pid
        })
      } else if (proc.pid === mainProcess.pid) {
        acc.set(proc.pid, {
          ...proc.memory,
          ...mainProcess.getCPUUsage(),
          description: 'Main',
          pid: proc.pid
        })
      } else {
        acc.set(proc.pid, {
          ...prevProcessInfo.get(proc.pid),
          ...proc.memory,
          pid: proc.pid
        })
      }

      return acc
    }, new Map())
  }

  handleSubmitProcessResourceUsage ({ info }) {
    this.processInfo.set(info.pid, info)
  }
}

export default alt.createStore(MonitorStore, 'MonitorStore')
