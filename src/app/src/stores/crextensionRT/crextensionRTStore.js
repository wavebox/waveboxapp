import CoreCRExtensionRTStore from 'shared/AltStores/CRExtensionRT/CoreCRExtensionRTStore'
import alt from '../alt'
import { STORE_NAME } from 'shared/AltStores/CRExtensionRT/AltCRExtensionRTIdentifiers'
import actions from './crextensionRTActions'
import { CRExtensionManager } from 'Extensions/Chrome'

class CRExtensionRTStore extends CoreCRExtensionRTStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    /* ****************************************/
    // Actions
    /* ****************************************/

    this.bindActions({

    })
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Overwrite
  */
  _remoteConnectReturnValue () {
    return {
      runtimeData: CRExtensionManager.runtimeHandler.getRuntimeData(), //TODO add to runtime, depricate ipc
      installMeta: CRExtensionManager.generateInstallMetadata() //TODO add to manager, depricate ipc
    }
  }
}

export default alt.createStore(CRExtensionRTStore, STORE_NAME)
