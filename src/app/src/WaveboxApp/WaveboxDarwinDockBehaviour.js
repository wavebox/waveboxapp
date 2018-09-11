import { app } from 'electron'
import { settingsStore } from 'stores/settings'
import { SUPPORTS_DOCK_HIDING } from 'shared/Models/Settings/TraySettings'
import WaveboxWindow from 'Windows/WaveboxWindow'

class WaveboxDarwinDockBehaviour {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    if (process.platform === 'darwin') {
      app.on('browser-window-blur', this._updateDock)
      app.on('browser-window-focus', this._updateDock)
    }
  }

  setup () { /* no-op */ }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Updates the dock based on visible windows
  */
  _updateDock = () => {
    if (!SUPPORTS_DOCK_HIDING) { return }

    const { tray } = settingsStore.getState()
    if (tray.show && tray.removeFromDockDarwin) {
      // Don't trigger on the traypopup. Use the WaveboxWindow API rather than BrowserWindow as
      // this will only check actual-windows not pseudo-windows
      const visibleWindow = WaveboxWindow.all().find((w) => w.isVisible())
      if (!visibleWindow) {
        if (app.dock.isVisible()) {
          app.dock.hide()
        }
      } else {
        if (!app.dock.isVisible()) {
          app.dock.show()
        }
      }
    }
  }
}

export default new WaveboxDarwinDockBehaviour()
