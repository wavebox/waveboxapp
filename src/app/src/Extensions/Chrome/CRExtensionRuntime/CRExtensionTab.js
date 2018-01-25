import { BrowserWindow, webContents } from 'electron'
import WaveboxWindow from 'Windows/WaveboxWindow'

class CRExtensionTab {
  /* ****************************************************************************/
  // Data converters
  /* ****************************************************************************/

  /**
  * Generates the tab data from the given web contentsId depending on the permissions
  * @param extension=undefined: the extension to get the data for
  * @param webContentsId: the webcontent id to generate from
  * @return the raw tab data
  */
  static dataFromWebContentsId (extension = undefined, webContentsId) {
    const wc = webContents.fromId(webContentsId)
    if (!wc || wc.isDestroyed()) {
      return { id: webContentsId }
    } else {
      return this.dataFromWebContents(extension, wc)
    }
  }

  /**
  * Generates the tab data from the given web contents depending on the permissions
  * @param extension=undefined: the extension to get the data for
  * @param webContents: the webcontents to generate from
  * @return the raw tab data
  */
  static dataFromWebContents (extension = undefined, webContents) {
    const browserWindow = BrowserWindow.fromWebContents(webContents.hostWebContents ? webContents.hostWebContents : webContents)
    const waveboxWindow = browserWindow ? WaveboxWindow.fromBrowserWindowId(browserWindow.id) : undefined

    return {
      id: webContents.id,
      ...(browserWindow && !browserWindow.isDestroyed() ? {
        windowId: browserWindow.id
      } : undefined),
      ...(waveboxWindow ? {
        active: waveboxWindow.focusedTabId() === webContents.id
      } : undefined),
      ...(extension && extension.manifest.permissions.has('tabs') ? {
        url: webContents.getURL(),
        title: webContents.getTitle()
      } : undefined)
    }
  }
}

export default CRExtensionTab
