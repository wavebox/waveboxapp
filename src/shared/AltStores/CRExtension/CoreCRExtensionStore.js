import RemoteStore from '../RemoteStore'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltCRExtensionIdentifiers'
const {
  CRExtensionManifest
} = require('../../Models/CRExtension')
const {
  CRExtensionRTBrowserAction
} = require('../../Models/CRExtensionRT')

class CoreCRExtensionStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)

    this.manifests = new Map()
    this.installMeta = new Map()
    this.browserActions = new Map()

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
    // Browser Actions
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
      return new CRExtensionRTBrowserAction(
        extensionId,
        tabId,
        compositeJS
      )
    }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD,
      handleInstallMetaChanged: actions.INSTALL_META_CHANGED,
      handleBrowserActionChanged: actions.BROWSER_ACTION_CHANGED
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad ({runtimeData, installMeta}) {
    Object.keys(runtimeData)
      .forEach((extensionId) => {
        const {
          manifest,
          browserAction
        } = runtimeData[extensionId]

        // Manifest
        const manifestModel = new CRExtensionManifest(manifest)
        this.manifests.set(extensionId, manifestModel)

        // Browser actions
        if (browserAction.global) {
          this.saveBrowserAction(extensionId, undefined, browserAction.global)
        }
        Object.keys(browserAction.tabs).forEach((tabId) => {
          this.saveBrowserAction(extensionId, tabId, browserAction.tabs[tabId])
        })
      })

    Object.keys(installMeta)
      .forEach((extensionId) => {
        this.installMeta.set(extensionId, installMeta[extensionId])
      })
  }

  /* **************************************************************************/
  // Install metadata & lifecycle
  /* **************************************************************************/

  handleInstallMetaChanged ({metadata}) {
    Object.keys(metadata)
      .forEach((extensionId) => {
        this.installMeta.set(extensionId, metadata[extensionId])
      })
    if (process.type === 'browser') {
      this.dispatchToRemote('installMetaChanged', [metadata])
    }
  }

  /* **************************************************************************/
  // Browser Action
  /* **************************************************************************/

  /**
  * Saves a browser action
  * @param extensionId: the id of the extension
  * @param tabId: the id of the tab if available
  * @param data: the data to set in the action
  * @return the saved action
  */
  saveBrowserAction (extensionId, tabId, data) {
    const browserAction = new CRExtensionRTBrowserAction(extensionId, tabId, data)
    if (!this.browserActions.has(extensionId)) {
      this.browserActions.set(extensionId, new Map())
    }
    this.browserActions.get(extensionId).set(tabId, browserAction)
  }

  handleBrowserActionChanged ({extensionId, tabId, browserAction}) {
    this.saveBrowserAction(extensionId, tabId, browserAction)
    if (process.type === 'browser') {
      this.dispatchToRemote('browserActionChanged', [extensionId, tabId, browserAction])
    }
  }
}

export default CoreCRExtensionStore
