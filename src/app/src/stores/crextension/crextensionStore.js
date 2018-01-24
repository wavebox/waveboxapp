import CoreCRExtensionStore from 'shared/AltStores/CRExtension/CoreCRExtensionStore'
import alt from '../alt'
import { STORE_NAME } from 'shared/AltStores/CRExtension/AltCRExtensionIdentifiers'
import actions from './crextensionActions'  // eslint-disable-line
import { CRExtensionManager } from 'Extensions/Chrome'

class CRExtensionStore extends CoreCRExtensionStore {
  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Overwrite
  */
  _remoteConnectReturnValue () {
    return {
      runtimeData: CRExtensionManager.runtimeHandler.getRuntimeData(),
      installMeta: CRExtensionManager.generateInstallMetadata()
    }
  }
}

export default alt.createStore(CRExtensionStore, STORE_NAME)
