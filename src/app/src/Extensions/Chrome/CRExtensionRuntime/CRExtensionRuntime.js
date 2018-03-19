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
import CRExtensionWebRequest from './CRExtensionWebRequest'
import CRExtensionCookies from './CRExtensionCookies'
import CRExtensionTabs from './CRExtensionTabs'
import CRExtensionWindows from './CRExtensionWindows'
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
    this.webRequest = new CRExtensionWebRequest(extension)
    this.cookies = new CRExtensionCookies(extension)
    this.tabs = new CRExtensionTabs(extension)
    this.windows = new CRExtensionWindows(extension)

    // Pages second
    this.backgroundPage = new CRExtensionBackgroundPage(extension)
    this.contentScript = new CRExtensionContentScript(extension, this.datasource)
    this.optionsPage = new CRExtensionOptionsPage(extension)

    // Binding
    this.tabs.backgroundPageSender = this.backgroundPage.sendToWebContents
    this.windows.backgroundPageSender = this.backgroundPage.sendToWebContents
    this.cookies.backgroundPageSender = this.backgroundPage.sendToWebContents

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
    this.webRequest.destroy()
    this.cookies.destroy()
    this.tabs.destroy()
    this.windows.destroy()

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
      browserAction: this.browserAction.buildUIRuntimeData()
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
  * @return { mode, match, extension } the popout mode if the window should open as popout along with the extension model or false if the extension has no preference
  */
  getWindowPopoutModePreference (webContentsId, url, parsedUrl, disposition) {
    if (this.connectedContentScripts.has(webContentsId)) {
      const preference = this.extension.manifest.wavebox.getWindowPopoutModePreference(url, parsedUrl, disposition)
      if (preference) {
        return { mode: preference.mode, match: preference.match, extension: this.extension }
      }
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

  /* ****************************************************************************/
  // WebRequest
  /* ****************************************************************************/

  /**
  * Runs the before request code provided by the extension
  * @param details: the details of the request
  * @return modifiers that will cancel or redirect the request or undefined
  */
  runExtensionOnBeforeRequest = (details) => {
    return this.webRequest ? this.webRequest.blockingOnBeforeRequest(details) : undefined
  }
}

export default CRExtensionRuntime
