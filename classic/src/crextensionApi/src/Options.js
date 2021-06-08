import { ipcRenderer } from 'electronCrx'
import {
  CRX_OPTIONS_OPEN_,
  CRX_OPTIONS_CREATE_FROM_BG_
} from 'shared/crExtensionIpcEvents'
import {
  CR_RUNTIME_ENVIRONMENTS
} from 'shared/extensionApis'
import uuid from 'uuid'
import { protectedJSWindowTracker } from 'Runtime/ProtectedRuntimeSymbols'

const privExtensionId = Symbol('privExtensionId')
const privRuntime = Symbol('privRuntime')
const privRuntimeEnvironment = Symbol('privRuntimeEnvironment')

class Options {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param extensionId: the id of the extension
  * @param runtimeEnvironment: the current runtime environment
  * @param runtime: the runtime object we proxy some requests through for
  */
  constructor (extensionId, runtimeEnvironment, runtime) {
    this[privExtensionId] = extensionId
    this[privRuntimeEnvironment] = runtimeEnvironment
    this[privRuntime] = runtime

    if (runtimeEnvironment === CR_RUNTIME_ENVIRONMENTS.BACKGROUND) {
      ipcRenderer.on(`${CRX_OPTIONS_OPEN_}${extensionId}`, (evt, url) => {
        const transId = uuid.v4()
        ipcRenderer.send(`${CRX_OPTIONS_CREATE_FROM_BG_}${extensionId}`, transId, url)
        const opened = window.open(url)
        ipcRenderer.once(`${CRX_OPTIONS_CREATE_FROM_BG_}${extensionId}${transId}`, (evt, err, tabData) => {
          if (tabData) {
            this[privRuntime][protectedJSWindowTracker].add(tabData.id, 'tab', opened)
          }
        })
      })
    }

    Object.freeze(this)
  }
}

export default Options
