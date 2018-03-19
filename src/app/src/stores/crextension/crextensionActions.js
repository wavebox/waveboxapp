import CoreCRExtensionActions from 'shared/AltStores/CRExtension/CoreCRExtensionActions'
import { CRExtensionManager } from 'Extensions/Chrome'
import { evtMain } from 'AppEvents'
import alt from '../alt'

class CRExtensionActions extends CoreCRExtensionActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return {
      runtimeData: CRExtensionManager.runtimeHandler.getRuntimeData(),
      installMeta: CRExtensionManager.generateInstallMetadata()
    }
  }

  /* **************************************************************************/
  // Install metadata & lifecycle
  /* **************************************************************************/

  /**
  * @overwrite
  */
  uninstallExtension (extensionId) {
    CRExtensionManager.uninstallExtension(extensionId)
    return Promise.resolve() // Suppress
  }

  /**
  * @overwrite
  */
  installExtension (extensionId, installInfo) {
    CRExtensionManager.installExtension(extensionId, installInfo)
    return Promise.resolve() // Suppress
  }

  /**
  * Updates the installed extensions
  */
  updateInstalledExtensions () {
    CRExtensionManager.updateExtensions()
    return Promise.resolve() // Suppress
  }

  /* **************************************************************************/
  // Browser Action
  /* **************************************************************************/

  /**
  * @overwrite
  */
  browserActionClicked (extensionId, tabId) {
    evtMain.emit(`${evtMain.WBECRX_BROWSER_ACTION_CLICKED_}${extensionId}`, {}, tabId)
    return Promise.resolve() // Suppress
  }

  /* **************************************************************************/
  // Settings & Inspect
  /* **************************************************************************/

  /**
  * @overwrite
  */
  openExtensionOptions (extensionId) {
    CRExtensionManager.runtimeHandler.openOptionsPage(extensionId)
    return Promise.resolve() // Suppress
  }

  /**
  * @overwrite
  */
  inspectBackgroundPage (extensionId) {
    CRExtensionManager.runtimeHandler.inspectBackgroundPage(extensionId)
    return Promise.resolve() // Suppress
  }

  /* **************************************************************************/
  // Data management
  /* **************************************************************************/

  /**
  * @overwrite
  */
  clearAllBrowserSessions () {
    CRExtensionManager.runtimeHandler.clearAllBrowserSessions()
    return Promise.resolve() // Suppress
  }
}

export default alt.createActions(CRExtensionActions)
