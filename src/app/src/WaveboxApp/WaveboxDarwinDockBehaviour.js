import { app, BrowserWindow } from 'electron'
import { settingsStore } from 'stores/settings'
import { SUPPORTS_DOCK_HIDING } from 'shared/Models/Settings/TraySettings'

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
      const visibleWindow = BrowserWindow.getAllWindows().find((w) => w.isVisible())
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
