const WaveboxWindow = require('./WaveboxWindow')
const path = require('path')
const MONITOR_DIR = path.resolve(path.join(__dirname, '/../../../scenes/monitor'))

class MonitorWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Creation
  /* ****************************************************************************/

  start () {
    return super.start(`file://${path.join(MONITOR_DIR, 'monitor.html')}`, {
      title: 'Wavebox Monitor',
      width: 660,
      height: 500
    })
  }

  /* ****************************************************************************/
  // Destruction
  /* ****************************************************************************/

  destroyWindow (evt) {
    clearInterval(this.updateInterval)
    super.destroyWindow(evt)
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
    this.window.webContents.send('submit-process-resource-usage', info)
    return this
  }
}

module.exports = MonitorWindow
