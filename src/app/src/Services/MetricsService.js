import { ipcMain, webContents, app, shell } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import mkdirp from 'mkdirp'
import WaveboxWindow from 'Windows/WaveboxWindow'
import MonitorWindow from 'Windows/MonitorWindow'
import { settingsStore } from 'stores/settings'
import {
  WB_METRICS_OPEN_MONITOR,
  WB_METRICS_OPEN_LOG,
  WB_METRICS_RELEASE_MEMORY
} from 'shared/ipcEvents'
import { METRICS_LOG_WRITE_INTERVAL } from 'shared/constants'
import RuntimePaths from 'Runtime/RuntimePaths'

const LOG_TAG = '[METRICS]'
mkdirp.sync(path.dirname(RuntimePaths.METRICS_LOG_PATH))

class MetricsService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this._logUpdater = null

    if (settingsStore.getState().app.writeMetricsLog) {
      this.updateMetricsLog()
      this._logUpdater = setInterval(this.updateMetricsLog, METRICS_LOG_WRITE_INTERVAL)
    }

    settingsStore.listen(this.handleSettingsChanged)
    ipcMain.on(WB_METRICS_OPEN_LOG, this.openMetricsLogLocation)
    ipcMain.on(WB_METRICS_OPEN_MONITOR, this.openMonitorWindow)
    ipcMain.on(WB_METRICS_RELEASE_MEMORY, this.freeV8Memory)
  }

  /* ****************************************************************************/
  // Settings events
  /* ****************************************************************************/

  /**
  * Handles the settings changing
  * @param next: the new settings
  */
  handleSettingsChanged = (settingsState) => {
    if (this._logUpdater === null) {
      if (settingsState.app.writeMetricsLog) {
        this.updateMetricsLog()
        this._logUpdater = setInterval(this.updateMetricsLog, METRICS_LOG_WRITE_INTERVAL)
      }
    } else {
      if (!settingsState.app.writeMetricsLog) {
        clearInterval(this._logUpdater)
        this._logUpdater = null
      }
    }
  }

  /* ****************************************************************************/
  // Task monitor
  /* ****************************************************************************/

  /**
  * Opens the monitor window
  */
  openMonitorWindow = () => {
    const existingWindow = WaveboxWindow.getOfType(MonitorWindow)
    if (existingWindow) {
      existingWindow.focus()
    } else {
      const newWindow = new MonitorWindow()
      newWindow.create()
    }
  }

  /* ****************************************************************************/
  // Clearing
  /* ****************************************************************************/

  /**
  * Tries to free v8 memory by running release memory on all webcontents
  */
  freeV8Memory = () => {
    webContents.getAllWebContents().forEach((wc) => {
      wc.releaseMemory()
    })
  }

  /* ****************************************************************************/
  // Logging
  /* ****************************************************************************/

  /**
  * Updates the metrics log
  */
  updateMetricsLog = () => {
    const metrics = this.getMetrics()
    const now = new Date()
    const logEntry = `${now} : ${now.getTime()} : ${JSON.stringify(metrics)}\n`
    Promise.resolve()
      .then(() => fs.appendFile(RuntimePaths.METRICS_LOG_PATH, logEntry))
      .then(() => {
        console.log(`${LOG_TAG}[${now}] Log updated`)
      })
      .catch((err) => {
        console.err(`${LOG_TAG}[${now}] Failed to update log:\n ${err}`)
      })
  }

  /**
  * Opens the metrics log location for the user
  */
  openMetricsLogLocation = () => {
    const success = shell.showItemInFolder(RuntimePaths.METRICS_LOG_PATH)
    if (success) { return }
    shell.openItem(path.dirname(RuntimePaths.METRICS_LOG_PATH))
  }

  /* ****************************************************************************/
  // Getting
  /* ****************************************************************************/

  /**
  * Builds the metrics for the currently running app
  * @return an array of process infos with as much data salted into each as possible
  */
  getMetrics () {
    // Using the tab API we can get more info about each webcontents
    const allTabInfos = WaveboxWindow.all().reduce((acc, win) => {
      win.webContentsProcessInfo().forEach((info) => {
        acc.set(info.webContentsId, info)
      })
      return acc
    }, new Map())

    // For anyone we don't have specific info about just grab what we can
    const allWebContentsInfo = webContents.getAllWebContents().reduce((acc, wc) => {
      if (allTabInfos.get(wc.id)) {
        acc.set(wc.id, allTabInfos.get(wc.id))
      } else {
        acc.set(wc.id, {
          webContentsId: wc.id,
          pid: wc.getOSProcessId(),
          url: wc.getURL()
        })
      }
      return acc
    }, new Map())

    // Sort the webcontents and tabs by pid
    const webContentsByPid = Array.from(allWebContentsInfo.values()).reduce((acc, info) => {
      if (!acc.has(info.pid)) {
        acc.set(info.pid, [])
      }
      acc.get(info.pid).push(info)
      return acc
    }, new Map())

    // Build the final metrics
    const metrics = app.getAppMetrics().map((metric) => {
      return {
        ...metric,
        webContentsInfo: webContentsByPid.get(metric.pid)
      }
    })

    return metrics
  }
}

export default MetricsService
