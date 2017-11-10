import { app, webContents } from 'electron'
import WaveboxWindow from './WaveboxWindow'
import { WB_COLLECTED_METRICS } from 'shared/ipcEvents'
import Resolver from 'Runtime/Resolver'

class MonitorWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Creation
  /* ****************************************************************************/

  create (url, browserWindowPreferences = {}) {
    super.create(`file://${Resolver.monitorScene('monitor.html')}`, {
      title: 'Wavebox Monitor',
      width: 900,
      height: 700,
      show: true
    })

    this.collectInterval = setInterval(this.collectMetrics, 1000)
  }

  destroy (evt) {
    clearTimeout(this.collectInterval)
    super.destroy(evt)
  }

  /* ****************************************************************************/
  // Collectors
  /* ****************************************************************************/

  /**
  * Collects the current stats and forwards them to the webcontents
  */
  collectMetrics = () => {
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
    this.window.webContents.send(WB_COLLECTED_METRICS, {
      metrics: metrics
    })
  }

  /* ****************************************************************************/
  // Info
  /* ****************************************************************************/

  focusedTabId () { return null }
  tabIds () { return [] }
}

export default MonitorWindow
