import { ipcRenderer } from 'electronCrx'
import Event from 'Core/Event'
import {
  CRX_WINDOW_FOCUS_CHANGED_
} from 'shared/crExtensionIpcEvents'

const privExtensionId = Symbol('privExtensionId')

class Windows {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/apps/windows
  * @param extensionId: the id of the extension
  * @param hasTabsPermission: true if we have tabs permission
  */
  constructor (extensionId, hasTabsPermission) {
    this[privExtensionId] = extensionId

    this.onFocusChanged = new Event()

    ipcRenderer.on(`${CRX_WINDOW_FOCUS_CHANGED_}${this[privExtensionId]}`, (evt, windowId) => {
      this.onFocusChanged.emit(windowId)
    })

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get WINDOW_ID_NONE () { return -1 }
}

export default Windows
