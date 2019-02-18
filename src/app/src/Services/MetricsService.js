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
  WB_METRICS_FETCH_CHROMIUM_METRICS
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
    ipcMain.on(WB_METRICS_FETCH_CHROMIUM_METRICS, this.ipcGetMetrics)
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
  * @param returnChannel: the channel to return the response on
  */
  ipcGetMetrics = (evt, returnChannel) => {
    Promise.resolve()
      .then(() => this.getMetrics())
      .then((metrics) => {
        if (evt.sender.isDestroyed()) { return }
        evt.sender.send(returnChannel, null, metrics)
      })
      .catch((err) => {
        if (evt.sender.isDestroyed()) { return }
        evt.sender.send(returnChannel, `${err}`, null)
      })
  }

  /* ****************************************************************************/
  // Logging
  /* ****************************************************************************/

  /**
  * Updates the metrics log
  */
  updateMetricsLog = () => {
    const now = new Date()
    Promise.resolve()
      .then(() => this.getMetrics())
      .then((metrics) => {
        return `${now} : ${now.getTime()} : ${JSON.stringify(metrics)}\n`
      })
      .then((logEntry) => fs.appendFile(RuntimePaths.METRICS_LOG_PATH, logEntry))
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
  * Gets info about all the webcontents
  * @return a map of webContent ids to their info
  */
  _getWebContentInfo () {
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

    return allWebContentsInfo
  }

  /**
  * Gets the webcontents info sorted by pid
  * @return a map containing PID against an array of webcontent infos
  */
  _getWebContentInfoByPid () {
    const allWebContentsInfo = this._getWebContentInfo()
    return Array.from(allWebContentsInfo.values()).reduce((acc, info) => {
      if (!acc.has(info.pid)) {
        acc.set(info.pid, [])
      }
      acc.get(info.pid).push(info)
      return acc
    }, new Map())
  }

  /**
  * Gets the metrics
  * @param extended=false: set to try for additional info
  * @return promise, given the supplied metrics
  */
  getMetrics (extended = false) {
    return Promise.resolve()
      .then(() => {
        const pidInfo = this._getWebContentInfoByPid()
        const metrics = app.getAppMetrics().map((metric) => {
          return {
            ...metric,
            webContentsInfo: pidInfo.get(metric.pid)
          }
        })
        return Promise.resolve(metrics)
      })
      .then((baseMetrics) => {
        const pids = baseMetrics.map((m) => m.pid)
        return Promise.resolve()
          .then(() => pidusage(pids))
          .then((osMetrics) => {
            const metrics = baseMetrics.map((metric) => {
              return {
                ...metric,
                memory: {
                  pid: metric.pid,
                  bytes: (osMetrics[metric.pid] || {}).memory || 0
                },
                ...(extended ? { extended: osMetrics[metric.pid] } : undefined)
              }
            })
            return metrics
          })
      })
  }

  /**
  * Gets the metrics for a single pid
  * @param pid: the pid to get metrics for
  * @param extended=false: set to try for additional info
  * @return promise, given the supplied metrics
  */
  getMetricsForPid (pid, extended = false) {
    return Promise.resolve()
      .then(() => {
        const pidInfo = this._getWebContentInfoByPid()
        const metric = app.getAppMetrics().find((metric) => metric.pid === pid)
        return Promise.resolve({
          ...metric,
          webContentsInfo: pidInfo.get(pid),
          pid: pid
        })
      })
      .then((baseMetric) => {
        return Promise.resolve()
          .then(() => pidusage([pid]))
          .then((osMetric) => {
            const metric = {
              ...baseMetric,
              memory: {
                pid: osMetric.pid,
                bytes: (osMetric[pid] || {}).memory || 0
              },
              ...(extended ? { extended: osMetric[pid] } : undefined)
            }
            return metric
          })
      })
  }
}

export default MetricsService
