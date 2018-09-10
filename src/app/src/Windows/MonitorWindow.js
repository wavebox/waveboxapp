import WaveboxWindow from './WaveboxWindow'
import { WB_COLLECTED_METRICS } from 'shared/ipcEvents'
import Resolver from 'Runtime/Resolver'
import ServicesManager from '../Services'

class MonitorWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Class: Properties
  /* ****************************************************************************/

  static get windowType () { return this.WINDOW_TYPES.MONITOR }

  /* ****************************************************************************/
  // Creation
  /* ****************************************************************************/

  create (url, browserWindowPreferences = {}) {
    super.create(`file://${Resolver.monitorScene('monitor.html')}`, {
      title: 'Wavebox Monitor',
      width: 900,
      height: 700,
      show: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: false,
        webviewTag: false
      }
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
    ServicesManager.metricsService.getExtendedMetrics().then((metrics) => {
      this.window.webContents.send(WB_COLLECTED_METRICS, { metrics: metrics })
    })
  }

  /* ****************************************************************************/
  // Query
  /* ****************************************************************************/

  focusedTabId () { return null }
  tabIds () { return [] }
  tabMetaInfo (tabId) { return undefined }

  /**
  * @return process info about the tabs with { webContentsId, description, pid }
  */
  webContentsProcessInfo () {
    return [{
      webContentsId: this.window.webContents.id,
      pid: this.window.webContents.getOSProcessId(),
      description: 'Wavebox Task Monitor'
    }]
  }
}

export default MonitorWindow
