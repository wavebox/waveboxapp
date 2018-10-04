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
  WB_METRICS_GET_CHROMIUM_METRICS_SYNC
} from 'shared/ipcEvents'
import { METRICS_LOG_WRITE_INTERVAL } from 'shared/constants'
import RuntimePaths from 'Runtime/RuntimePaths'
import TrayPopout from 'Tray/TrayPopout'
import LinuxNotification from 'Notifications/LinuxNotification'
import pidusage from 'pidusage'

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
    ipcMain.on(WB_METRICS_GET_CHROMIUM_METRICS_SYNC, this.ipcGetMetricsSync)
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
  // Getters
  /* ****************************************************************************/

  /**
  * Get the metrics synchronously
  * @param evt: the event that fired
  */
  ipcGetMetricsSync = (evt) => {
    try {
      evt.returnValue = this.getChromiumMetricsSync()
    } catch (ex) {
      console.error(`Failed to respond to "${WB_METRICS_GET_CHROMIUM_METRICS_SYNC}" continuing with unkown side effects`, ex)
      evt.returnValue = null
    }
  }

  /* ****************************************************************************/
  // Logging
  /* ****************************************************************************/

  /**
  * Updates the metrics log
  */
  updateMetricsLog = () => {
    const metrics = this.getChromiumMetricsSync()
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
  getChromiumMetricsSync () {
    // Using the tab API we can get more info about each webcontents
    const allTabInfos = WaveboxWindow.all().reduce((acc, win) => {
      win.webContentsProcessInfo().forEach((info) => {
        acc.set(info.webContentsId, info)
      })
      return acc
    }, new Map())

    // Add some info about system-non-window webcontents
    if (TrayPopout.isLoaded && TrayPopout.webContentsId !== undefined) {
      const wcId = TrayPopout.webContentsId
      const wc = webContents.fromId(wcId)
      allTabInfos.set(wcId, {
        webContentsId: wcId,
        pid: wc ? wc.getOSProcessId() : undefined,
        description: 'Wavebox Tray Popout'
      })
    }
    if (LinuxNotification.isLoaded && LinuxNotification.webContentsId !== undefined) {
      const wcId = LinuxNotification.webContentsId
      const wc = webContents.fromId(wcId)
      allTabInfos.set(wcId, {
        webContentsId: wcId,
        pid: wc ? wc.getOSProcessId() : undefined,
        description: 'Wavebox Notification Provider (Linux-only)'
      })
    }

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

  /**
  * Gets extended metrics, including chromium metrics and os metrics
  * @param silentErrors=true: if set to true, errors will be silent and
  *       as much info as available will be returned
  * @return promise, given the supplied metrics
  */
  getExtendedMetrics (silentErrors = true) {
    return new Promise((resolve, reject) => {
      const metrics = this.getChromiumMetricsSync().map((cMetric) => {
        return {
          webContentsInfo: cMetric.webContentsInfo,
          pid: cMetric.pid,
          type: cMetric.type,
          chromium: {
            ...cMetric,
            webContentsInfo: undefined
          }
        }
      })
      const pids = metrics.map((metric) => metric.pid)
      pidusage(pids, (err, osMetrics) => {
        if (err) {
          if (silentErrors) {
            resolve(metrics)
          } else {
            reject(err)
          }
        } else {
          const fullMetrics = metrics.map((cMetric) => {
            return {
              ...cMetric,
              os: osMetrics[cMetric.pid]
            }
          })
          resolve(fullMetrics)
        }
      })
    })
  }
}

export default MetricsService
