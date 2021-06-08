import { webFrame, ipcRenderer } from 'electron'
import {
  CRX_RUNTIME_CONTENTSCRIPT_PROVISION_CONTEXT_SYNC
} from 'shared/crExtensionIpcEvents'

const privWebFrameContextIds = Symbol('privWebFrameContextIds')

class ElectronPolyfill {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privWebFrameContextIds] = new Set()
  }

  /* **************************************************************************/
  // Polyfill
  /* **************************************************************************/

  /**
  * Polyfills some extra methods into the electron apis
  */
  polyfill () {
    this._polyfillWebFrameCreateContextId()
  }

  /* **************************************************************************/
  // WebFrame
  /* **************************************************************************/

  /**
  * Adds the create context id method into the webframe
  */
  _polyfillWebFrameCreateContextId () {
    if (webFrame.createContextId) { return }
    webFrame.createContextId = () => {
      const contextId = ipcRenderer.sendSync(CRX_RUNTIME_CONTENTSCRIPT_PROVISION_CONTEXT_SYNC)
      if (this[privWebFrameContextIds].has(contextId)) {
        throw new Error('Duplicate context ids provisioned')
      }
      this[privWebFrameContextIds].add(contextId)
      return contextId
    }
  }
}

export default new ElectronPolyfill()
