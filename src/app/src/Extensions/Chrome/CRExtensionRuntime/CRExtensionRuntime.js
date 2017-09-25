import { ipcMain } from 'electron'
import {
  CRX_RUNTIME_CONTENTSCRIPT_CONNECT_
} from 'shared/crExtensionIpcEvents'

import CRExtensionDatasource from './CRExtensionDatasource'
import CRExtensionBrowserAction from './CRExtensionBrowserAction'
import CRExtensionBackgroundPage from './CRExtensionBackgroundPage'
import CRExtensionContentScript from './CRExtensionContentScript'
import CRExtensionOptionsPage from './CRExtensionOptionsPage'
import CRExtensionStorage from './CRExtensionStorage'
import CRExtensionContextMenus from './CRExtensionContextMenus'
import { CRExtensionI18n } from 'shared/Models/CRExtension'

class CRExtensionRuntime {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.connectedContentScripts = new Set()

    // APIs first
    this.datasource = new CRExtensionDatasource(extension)
    this.browserAction = new CRExtensionBrowserAction(extension)
    this.contextMenus = new CRExtensionContextMenus(extension)
    this.storage = new CRExtensionStorage(extension)

    // Pages second
    this.backgroundPage = new CRExtensionBackgroundPage(extension)
    this.contentScript = new CRExtensionContentScript(extension)
    this.optionsPage = new CRExtensionOptionsPage(extension)

    // Runtime API
    ipcMain.on(`${CRX_RUNTIME_CONTENTSCRIPT_CONNECT_}${this.extension.id}`, this.handleContentScriptRuntimeConnect)
  }

  destroy () {
    // Pages first
    this.backgroundPage.destroy()
    this.contentScript.destroy()
    this.optionsPage.destroy()

    // APIs second
    this.datasource.destroy()
    this.browserAction.destroy()
    this.contextMenus.destroy()
    this.storage.destroy()

    // Runtime API
    ipcMain.removeListener(`${CRX_RUNTIME_CONTENTSCRIPT_CONNECT_}${this.extension.id}`, this.handleContentScriptRuntimeConnect)
  }

  /* ****************************************************************************/
  // Data state
  /* ****************************************************************************/

  /**
  * Builds the current UI state
  * @return all the config required for the ui
  */
  buildUIRuntimeData () {
    return {
      manifest: this.extension.manifest.cloneData(),
      browserAction: this.browserAction.buildUIRuntimeData(),
      contextMenus: this.contextMenus.buildUIRuntimeData()
    }
  }

  /**
  * Builds the data for the context menu
  * @param language: the language to get the data for
  * @return the config to build context menus all the config required for the ui
  */
  buildUIRuntimeContextMenuData (language) {
    const messages = language ? this.datasource.getMessages(language) : {}
    return {
      extensionId: this.extension.id,
      name: CRExtensionI18n.translateManifestField(messages, this.extension.manifest.name),
      icons: this.extension.manifest.getIconsRelativeTo(this.extension.srcPath),
      contextMenus: this.contextMenus.buildUIRuntimeData()
    }
  }

  /* ****************************************************************************/
  // Window open
  /* ****************************************************************************/

  /**
  * Checks to see if a window should open as a popout
  * @param webContentsId: the id of the webcontents
  * @param url: the url to open with
  * @param parsedUrl: the parsed url
  * @param disposition: the open mode disposition
  * @return true if the window should open as popout
  */
  shouldOpenWindowAsPopout (webContentsId, url, parsedUrl, disposition) {
    if (this.connectedContentScripts.has(webContentsId)) {
      return this.extension.manifest.shouldOpenWindowAsPopout(url, parsedUrl, disposition)
    }
    return false
  }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Handles the runtime in the contentscript connecting
  * @param evt: the event that fired
  */
  handleContentScriptRuntimeConnect = (evt) => {
    this.connectedContentScripts.add(evt.sender.id)
  }
}

export default CRExtensionRuntime
