import { ipcMain, webContents } from 'electron'
import {
  CRX_RUNTIME_CONTENTSCRIPT_CONNECT_,
  CRX_GET_WEBCONTENT_META_SYNC_
} from 'shared/crExtensionIpcEvents'
import { CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import WaveboxWindow from 'Windows/WaveboxWindow'
import { URL } from 'url'

import CRExtensionDatasource from './CRExtensionDatasource'
import CRExtensionBrowserAction from './CRExtensionBrowserAction'
import CRExtensionBackgroundPage from './CRExtensionBackgroundPage'
import CRExtensionContentScript from './CRExtensionContentScript'
import CRExtensionStorage from './CRExtensionStorage'
import CRExtensionContextMenus from './CRExtensionContextMenus'
import CRExtensionWebRequest from './CRExtensionWebRequest'
import CRExtensionCookies from './CRExtensionCookies'
import CRExtensionTabs from './CRExtensionTabs'
import CRExtensionTab from './CRExtensionTab'
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

    // Binding
    this.tabs.backgroundPageSender = this.backgroundPage.sendToWebContents
    this.tabs.extensionWindowSender = this.extensionWindowSender
    this.windows.backgroundPageSender = this.backgroundPage.sendToWebContents
    this.windows.extensionWindowSender = this.extensionWindowSender
    this.cookies.backgroundPageSender = this.backgroundPage.sendToWebContents
    this.browserAction.backgroundPageSender = this.backgroundPage.sendToWebContents

    // Runtime API
    ipcMain.on(`${CRX_RUNTIME_CONTENTSCRIPT_CONNECT_}${this.extension.id}`, this.handleContentScriptRuntimeConnect)

    // Extension Api
    ipcMain.on(`${CRX_GET_WEBCONTENT_META_SYNC_}${this.extension.id}`, this.handleGetWebcontentMetaSync)
  }

  destroy () {
    // Pages first
    this.backgroundPage.destroy()
    this.contentScript.destroy()

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

    // Extension Api
    ipcMain.removeListener(`${CRX_GET_WEBCONTENT_META_SYNC_}${this.extension.id}`, this.handleGetWebcontentMetaSync)
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
    let isActiveForRequest = false
    if (this.connectedContentScripts.has(webContentsId)) {
      isActiveForRequest = true
    } else {
      try {
        const wc = webContents.fromId(webContentsId)
        const currentUrl = new URL((wc ? wc.getURL() : undefined) || 'about:blank')
        if (currentUrl.protocol === `${CR_EXTENSION_PROTOCOL}:` && currentUrl.hostname === this.extension.id) {
          isActiveForRequest = true
        }
      } catch (ex) {
        /* no-op */
      }
    }

    if (isActiveForRequest) {
      const preference = this.extension.manifest.wavebox.getWindowPopoutModePreference(url, parsedUrl, disposition)
      if (preference) {
        return { mode: preference.mode, match: preference.match, extension: this.extension }
      }
    }
    return false
  }

  /* ****************************************************************************/
  // Event handlers: Runtime
  /* ****************************************************************************/

  /**
  * Handles the runtime in the contentscript connecting
  * @param evt: the event that fired
  */
  handleContentScriptRuntimeConnect = (evt) => {
    this.connectedContentScripts.add(evt.sender.id)
  }

  /* ****************************************************************************/
  // Event handlers: Extension
  /* ****************************************************************************/

  /**
  * Gets some metadata about webcontents
  * @param evt: the event that fired
  * @param webContentIds: an array of webcontent ids to get the metadata for
  */
  handleGetWebcontentMetaSync = (evt, webContentIds) => {
    try {
      const meta = webContentIds.map((wcId) => {
        return CRExtensionTab.dataFromWebContentsId(this.extension, wcId)
      })
      evt.returnValue = meta
    } catch (ex) {
      console.error(`Failed to respond to "${CRX_GET_WEBCONTENT_META_SYNC_}" continuing with unkown side effects`, ex)
      evt.returnValue = {}
    }
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

  /* ****************************************************************************/
  // Senders
  /* ****************************************************************************/

  /**
  * Sends events to the extension relevant open extension windows
  * @param ...args: the args to pass down
  */
  extensionWindowSender = (...args) => {
    const tabs = WaveboxWindow.allTabMetaWithBacking(WINDOW_BACKING_TYPES.EXTENSION)
    Array.from(tabs.keys()).forEach((tabId) => {
      if (tabs.get(tabId).extensionId === this.extensionId) {
        const wc = webContents.fromId(tabId)
        if (wc && !wc.isDestroyed()) {
          wc.send(...args)
        }
      }
    })
  }
}

export default CRExtensionRuntime
