import WaveboxWindow from './WaveboxWindow'
import { WB_SUBMIT_PROCESS_RESOURCE_USAGE } from 'shared/ipcEvents'
import Resolver from 'Runtime/Resolver'

class MonitorWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Creation
  /* ****************************************************************************/

  create (url, browserWindowPreferences = {}) {
    super.create(`file://${Resolver.monitorScene('monitor.html')}`, {
      title: 'Wavebox Monitor',
      width: 660,
      height: 500,
      show: true
    })
  }

  /* ****************************************************************************/
  // Info
  /* ****************************************************************************/

  /**
  * Sends the resource usage to the monitor window
  * @param info: the info to send
  * @return this
  */
  submitProcessResourceUsage (info) {
    this.window.webContents.send(WB_SUBMIT_PROCESS_RESOURCE_USAGE, info)
    return this
  }
}

export default MonitorWindow
