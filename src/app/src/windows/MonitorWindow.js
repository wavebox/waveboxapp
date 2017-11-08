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
    const windowInfos = WaveboxWindow.all().reduce((acc, win) => {
      win.webContentsProcessInfo().forEach((info) => {
        acc.set(info.pid, info)
      })
      return acc
    }, new Map())
    const allWebContents = webContents.getAllWebContents().reduce((acc, wc) => {
      acc.set(wc.getOSProcessId(), wc)
      return acc
    }, new Map())
    const metrics = app.getAppMetrics().map((metric) => {
      return {
        ...metric,
        description: (windowInfos.get(metric.pid) || {}).description,
        url: allWebContents.get(metric.pid) ? allWebContents.get(metric.pid).getURL() : undefined
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
