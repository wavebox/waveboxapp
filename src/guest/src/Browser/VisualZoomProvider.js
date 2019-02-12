import { webFrame, ipcRenderer } from 'electron'
import { WB_WINDOW_RESET_VISUAL_ZOOM } from 'shared/ipcEvents'

class VisualZoomProvider {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * This module enables pinch-and-zoom behaviour in the same way that chrome does
  */
  constructor () {
    webFrame.setVisualZoomLevelLimits(1, 3) // disabled by default
    ipcRenderer.on(WB_WINDOW_RESET_VISUAL_ZOOM, this._handleResetVisualZoom)
  }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  /**
  * Resets the visual zoom
  */
  _handleResetVisualZoom = () => {
    webFrame.setVisualZoomLevelLimits(1, 1)
    webFrame.setVisualZoomLevelLimits(1, 3)
  }
}

export default VisualZoomProvider
