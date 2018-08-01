import { BrowserWindow } from 'electron'
import WaveboxWindow from 'Windows/WaveboxWindow'

class CRExtensionWindow {
  /* ****************************************************************************/
  // Data converters
  /* ****************************************************************************/

  /**
  * Generates the window data from the given browser window id depending on the permissions
  * @param extension=undefined: the extension to get the data for
  * @param browserWindowId: the browserWindow id to generate from
  * @return the raw tab data
  */
  static dataFromBrowserWindowId (extension = undefined, browserWindowId) {
    const bw = BrowserWindow.fromId(browserWindowId)
    if (!bw || bw.isDestroyed()) {
      return { id: browserWindowId }
    } else {
      return this.dataFromBrowserWindow(extension, bw)
    }
  }

  /**
  * Generates the tab data from the given browserWindow depending on the permissions
  * @param extension=undefined: the extension to get the data for
  * @param browserWindow: the browserWindow to generate from
  * @return the raw tab data
  */
  static dataFromBrowserWindow (extension = undefined, browserWindow) {
    const waveboxWindow = browserWindow ? WaveboxWindow.fromBrowserWindowId(browserWindow.id) : undefined
    const bounds = browserWindow.getContentBounds()

    return {
      id: browserWindow.id,
      focused: browserWindow.isFocused(),
      top: bounds.y,
      left: bounds.x,
      width: bounds.width,
      height: bounds.height,
      incognito: false,
      alwaysOnTop: false,
      ...(waveboxWindow ? {
        type: waveboxWindow.windowType === waveboxWindow.WINDOW_TYPES.CONTENT || waveboxWindow.windowType === waveboxWindow.WINDOW_TYPES.EXTENSION
          ? 'popup'
          : 'normal'
      } : {
        type: 'normal'
      }),
      ...(extension && extension.manifest.permissions.has('tabs') ? {
        tabIds: waveboxWindow ? waveboxWindow.tabIds() : []
      } : undefined)
    }
  }
}

export default CRExtensionWindow
