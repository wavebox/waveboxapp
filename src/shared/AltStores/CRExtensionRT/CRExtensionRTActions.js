const {
  WBECRX_BROWSER_ACTION_CHANGED,
  WBECRX_CONTEXT_MENUS_CHANGED,
  WBECRX_EXTENSION_INSTALL_META_CHANGED
} = require('../../ipcEvents')

class CRExtensionRTActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () { return {} }

  /* **************************************************************************/
  // Install metadata & lifecycle
  /* **************************************************************************/

  /**
  * Accepts new install metadata
  * @param evt: the ipc event
  * @param metadata: the metadata
  */
  installMetaChanged (evt, metadata) {
    return { metadata }
  }

  /**
  * Uninstalls an extension
  * @param extensionId: the id of the extension
  */
  uninstallExtension (extensionId) { return { extensionId } }

  /**
  * Installs an extension
  * @param extensionId: the id of the extension
  * @param installInfo: the info about the install
  */
  installExtension (extensionId, installInfo) { return { extensionId, installInfo } }

  /* **************************************************************************/
  // Browser Action
  /* **************************************************************************/

  /**
  * Accepts a new configuration for the browser action
  * @param evt: the ipc event
  * @param extensionId: the id of the extension
  * @param tabId: the id of the tab
  * @param browserAction: the browser action
  */
  browserActionChanged (evt, extensionId, tabId, browserAction) {
    return { extensionId, tabId, browserAction }
  }

  /**
  * Handles the browser action being clicked
  * @param extensionId: the id of the extension
  * @param tabId: the id of the tab when it was clicked
  */
  browserActionClicked (extensionId, tabId) {
    return { extensionId, tabId }
  }

  /* **************************************************************************/
  // Context menus
  /* **************************************************************************/

  /**
  * Creates a new context menu
  * @param evt: the ipc event
  * @param extensionId: the id of the extension
  * @param menus: the new menus
  */
  contextMenusChanged (evt, extensionId, menus) {
    return { extensionId, menus }
  }

  /* **************************************************************************/
  // Settings & Inspect
  /* **************************************************************************/

  /**
  * Opens the extension settings
  * @param extensionId: the id of the extension
  */
  openExtensionOptions (extensionId) { return { extensionId } }

  /**
  * Opens the background page insepctor
  * @param extensionId: the id of the extension
  */
  inspectBackgroundPage (extensionId) { return { extensionId } }

  /* **************************************************************************/
  // Data management
  /* **************************************************************************/

  /**
  * Clears all the browser sessions
  */
  clearAllBrowserSessions () { return {} }
}

module.exports = {
  CRExtensionRTActions: CRExtensionRTActions,
  bindIPCListeners: (ipcRenderer, actions) => {
    ipcRenderer.on(WBECRX_EXTENSION_INSTALL_META_CHANGED, actions.installMetaChanged)
    ipcRenderer.on(WBECRX_BROWSER_ACTION_CHANGED, actions.browserActionChanged)
    ipcRenderer.on(WBECRX_CONTEXT_MENUS_CHANGED, actions.contextMenusChanged)
  }
}
