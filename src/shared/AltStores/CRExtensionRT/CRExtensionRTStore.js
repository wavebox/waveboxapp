const {
  CRExtensionManifest
} = require('../../Models/CRExtension')
const {
  CRExtensionRTBrowserAction,
  CRExtensionRTContextMenu
} = require('../../Models/CRExtensionRT')
const {
  WBECRX_GET_EXTENSION_RUNTIME_DATA,
  WBECRX_LAUNCH_OPTIONS,
  WBECRX_BROWSER_ACTION_CLICKED_,
  WBECRX_GET_EXTENSION_INSTALL_META,
  WBECRX_INSPECT_BACKGROUND,
  WBECRX_INSTALL_EXTENSION,
  WBECRX_UNINSTALL_EXTENSION
} = require('../../ipcEvents')

const privIpcRenderer = Symbol('privIpcRenderer')
const privActions = Symbol('privActions')

class CRExtensionRTStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param ipcRenderer: the ipc renderer instance
  * @param actions: the setup actions
  */
  constructor (ipcRenderer, actions) {
    this[privIpcRenderer] = ipcRenderer
    this[privActions] = actions

    this.manifests = new Map()
    this.installMeta = new Map()
    this.browserActions = new Map()
    this.contextMenus = new Map()

    /* ****************************************/
    // Manifests
    /* ****************************************/

    /**
    * @param extensionId: the id of the extension
    * @return the manifest
    */
    this.getManifest = (extensionId) => {
      return this.manifests.get(extensionId)
    }

    /**
    * @return the extension ids in order
    */
    this.extensionIds = () => {
      return Array.from(this.manifests.keys())
    }

    /**
    * @return the manifests in order
    */
    this.manifestList = () => {
      return this.extensionIds()
        .map((extensionId) => this.getManifest(extensionId))
        .filter((manifest) => !!manifest)
    }

    /**
    * @param id: the id of the extension
    * @return true if the extension is installed
    */
    this.hasExtensionInstalled = (id) => {
      return this.manifests.has(id)
    }

    /* ****************************************/
    // Install metadata
    /* ****************************************/

    /**
    * @param extensionId: the id of the extension
    * @return true if the extension is waiting to be installed on relaunch
    */
    this.isWaitingInstall = (extensionId) => {
      const meta = this.installMeta.get(extensionId)
      return meta ? meta.willInstall : false
    }

    /**
    * @param extensionId: the id of the extension
    * @return true if the extension is waiting to be uninstalled on relaunch
    */
    this.isWaitingUninstall = (extensionId) => {
      const meta = this.installMeta.get(extensionId)
      return meta ? meta.willUninstall : false
    }

    /**
    * @param extensionId: the id of the extension
    * @return true if the extension is installed
    */
    this.isInstalled = (extensionId) => {
      const meta = this.installMeta.get(extensionId)
      return meta ? meta.installed : false
    }

    /**
    * @param extensionId: the id of the extension
    * @return true if the extension is downloading
    */
    this.isDownloading = (extensionId) => {
      const meta = this.installMeta.get(extensionId)
      return meta ? meta.downloading : false
    }

    /**
    * @param extensionId: the id of the extension
    * @return true if the extension is waiting to update
    */
    this.isWaitingUpdate = (extensionId) => {
      const meta = this.installMeta.get(extensionId)
      return meta ? meta.willUpdate : false
    }

    this.isCheckingUpdate = (extensionId) => {
      const meta = this.installMeta.get(extensionId)
      return meta ? meta.checkingUpdates : false
    }

    /**
    * @param extensionId: the id of the extension
    * @return true if the extension is installed with a background page
    */
    this.hasBackgroundPage = (extensionId) => {
      if (this.isInstalled(extensionId)) {
        return this.getManifest(extensionId).hasBackground
      } else {
        return false
      }
    }

    /**
    * @param extensionId: the id of the extension
    * @return true if the extension is installed with an options page
    */
    this.hasOptionsPage = (extensionId) => {
      if (this.isInstalled(extensionId)) {
        return this.getManifest(extensionId).hasOptionsPage
      } else {
        return false
      }
    }

    /* ****************************************/
    // Browser extensions
    /* ****************************************/

    /**
    * @return the number of extensions with a browser extension
    */
    this.browserActionExtensionCount = () => {
      return this.manifestList().reduce((acc, manifest) => {
        return acc + manifest.hasBrowserAction ? 1 : 0
      }, 0)
    }

    /**
    * @return the extension ids that have a browser action
    */
    this.browserActionExtensionIds = () => {
      return this.manifestList()
        .filter((manifest) => manifest.hasBrowserAction)
        .map((manifest) => manifest.id)
    }

    /**
    * @return the manifests that have a browser action
    */
    this.browserActionManifests = () => {
      return this.browserActionExtensionIds()
        .map((id) => this.getManifest(id))
    }

    /**
    * @param extensionId: the extension id
    * @param tabId: the tab id
    * @return a new CRExtensionRTBrowserAction that is composed of global and tab
    */
    this.composedBrowserAction = (extensionId, tabId) => {
      const extensionBA = this.browserActions.get(extensionId)
      const globalBA = extensionBA ? extensionBA.get(undefined) : undefined
      const tabBA = extensionBA ? extensionBA.get(tabId) : undefined
      const compositeJS = {
        ...(globalBA ? globalBA.cloneData() : undefined),
        ...(tabBA ? tabBA.cloneData() : undefined)
      }
      return new CRExtensionRTBrowserAction(extensionId, tabId, compositeJS)
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleLoad: actions.LOAD,

      handleInstallMetaChanged: actions.INSTALL_META_CHANGED,
      handleUninstallExtension: actions.UNINSTALL_EXTENSION,
      handleInstallExtension: actions.INSTALL_EXTENSION,

      handleBrowserActionChanged: actions.BROWSER_ACTION_CHANGED,
      handleBrowserActionClicked: actions.BROWSER_ACTION_CLICKED,

      handleContextMenusChanged: actions.CONTEXT_MENUS_CHANGED,

      handleOpenExtensionOptions: actions.OPEN_EXTENSION_OPTIONS,
      handleInspectBackgroundPage: actions.INSPECT_BACKGROUND_PAGE
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad () {
    const runtimeData = this[privIpcRenderer].sendSync(WBECRX_GET_EXTENSION_RUNTIME_DATA)
    Object.keys(runtimeData)
      .forEach((extensionId) => {
        const {
          manifest,
          browserAction,
          contextMenus
        } = runtimeData[extensionId]

        // Manifest
        const manifestModel = new CRExtensionManifest(manifest)
        this.manifests.set(extensionId, manifestModel)

        // Browser actions
        if (browserAction.global) {
          this._saveBrowserAction(extensionId, undefined, browserAction.global)
        }
        Object.keys(browserAction.tabs).forEach((tabId) => {
          this._saveBrowserAction(extensionId, tabId, browserAction.tabs[tabId])
        })

        // Context menus
        this._saveContextMenus(extensionId, contextMenus)
      })

    const installMeta = this[privIpcRenderer].sendSync(WBECRX_GET_EXTENSION_INSTALL_META)
    Object.keys(installMeta)
      .forEach((extensionId) => {
        this.installMeta.set(extensionId, installMeta[extensionId])
      })
  }

  /* **************************************************************************/
  // Install metadata
  /* **************************************************************************/

  handleInstallMetaChanged ({ metadata }) {
    Object.keys(metadata)
      .forEach((extensionId) => {
        this.installMeta.set(extensionId, metadata[extensionId])
      })
  }

  handleUninstallExtension ({ extensionId }) {
    this.preventDefault()
    this[privIpcRenderer].send(WBECRX_UNINSTALL_EXTENSION, extensionId)
  }

  handleInstallExtension ({ extensionId, installInfo }) {
    this.preventDefault()
    this[privIpcRenderer].send(WBECRX_INSTALL_EXTENSION, extensionId, installInfo)
  }

  /* **************************************************************************/
  // Browser actions
  /* **************************************************************************/

  /**
  * Saves a browser action
  * @param extensionId: the id of the extension
  * @param tabId: the id of the tab if available
  * @param data: the data to set in the action
  * @return the saved action
  */
  _saveBrowserAction (extensionId, tabId, data) {
    const browserAction = new CRExtensionRTBrowserAction(extensionId, tabId, data)
    if (!this.browserActions.has(extensionId)) {
      this.browserActions.set(extensionId, new Map())
    }
    this.browserActions.get(extensionId).set(tabId, browserAction)
  }

  handleBrowserActionChanged ({ extensionId, tabId, browserAction }) {
    this._saveBrowserAction(extensionId, tabId, browserAction)
  }

  /* **************************************************************************/
  // Context menu
  /* **************************************************************************/

  /**
  * Saves the context menus
  * @param extensionId: the id of the extension
  * @param data: the menus for that extension as an array
  * @return the saved menus
  */
  _saveContextMenus (extensionId, data) {
    const contextMenuModels = data
      .map(([id, d]) => new CRExtensionRTContextMenu(extensionId, id, d))
    this.contextMenus.set(extensionId, contextMenuModels)
    return contextMenuModels
  }

  handleContextMenusChanged ({ extensionId, menus }) {
    this._saveContextMenus(extensionId, menus)
  }

  handleBrowserActionClicked ({ extensionId, tabId }) {
    this.preventDefault()
    this[privIpcRenderer].send(`${WBECRX_BROWSER_ACTION_CLICKED_}${extensionId}`, tabId)
  }

  /* **************************************************************************/
  // Settings & Inspect
  /* **************************************************************************/

  handleOpenExtensionOptions ({ extensionId }) {
    this.preventDefault()
    this[privIpcRenderer].send(WBECRX_LAUNCH_OPTIONS, extensionId)
  }

  handleInspectBackgroundPage ({ extensionId }) {
    this.preventDefault()
    this[privIpcRenderer].send(WBECRX_INSPECT_BACKGROUND, extensionId)
  }
}

module.exports = CRExtensionRTStore
