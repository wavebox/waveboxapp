import CoreCRExtensionRTActions from 'shared/AltStores/CRExtensionRT/CoreCRExtensionRTActions'
import { CRExtensionManager } from 'Extensions/Chrome'
import { evtMain } from 'AppEvents'
import alt from '../alt'

class CRExtensionRTActions extends CoreCRExtensionRTActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return {
      runtimeData: CRExtensionManager.runtimeHandler.getRuntimeData(), //TODO add to runtime, depricate ipc
      installMeta: CRExtensionManager.generateInstallMetadata() //TODO add to manager, depricate ipc
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

  /* **************************************************************************/
  // Browser Action
  /* **************************************************************************/

  /**
  * @overwrite
  */
  browserActionClicked (extensionId, tabId) {
    evtMain.emit(`${evtMain.WBECRX_BROWSER_ACTION_CLICKED_}${extensionId}`, tabId) //TODO add to evtMain
    return Promise.resolve() // Suppress
  }

  /* **************************************************************************/
  // Settings & Inspect
  /* **************************************************************************/

  /**
  * @overwrite
  */
  openExtensionOptions (extensionId) {
    CRExtensionManager.runtimeHandler.openOptionsPage(extensionId) //TODO add to runtime. depricate ipc
    return Promise.resolve() // Suppress
  }

  /**
  * @overwrite
  */
  inspectBackgroundPage (extensionId) {
    CRExtensionManager.runtimeHandler.inspectBackgroundPage(extensionId) //TODO add to runtime. depricate ipc
    return Promise.resolve() // Suppress
  }

  /* **************************************************************************/
  // Data management
  /* **************************************************************************/

  /**
  * @overwrite
  */
  clearAllBrowserSessions () {
    CRExtensionManager.runtimeHandler.clearAllBrowserSessions() //TODO add to runtime. depricate ipc
    return Promise.resolve() // Suppress
  }
}

export default alt.createActions(CRExtensionRTActions)
