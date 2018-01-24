import CoreCRExtensionRTStore from 'shared/AltStores/CRExtensionRT/CoreCRExtensionRTStore'
import alt from '../alt'
import { STORE_NAME } from 'shared/AltStores/CRExtensionRT/AltCRExtensionRTIdentifiers'
import actions from './crextensionRTActions'  // eslint-disable-line
import { CRExtensionManager } from 'Extensions/Chrome'

class CRExtensionRTStore extends CoreCRExtensionRTStore {
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

export default alt.createStore(CRExtensionRTStore, STORE_NAME)
