import { ipcRenderer } from 'electronCrx'
import Event from 'Core/Event'
import ArgParser from 'Core/ArgParser'
import DispatchManager from 'Core/DispatchManager'
import {
  CRX_WINDOW_FOCUS_CHANGED_,
  CRX_WINDOW_GET_ALL_
} from 'shared/crExtensionIpcEvents'
import Window from './Window'

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

  /* **************************************************************************/
  // Methods
  /* **************************************************************************/

  getAll (...fullArgs) {
    const { callback, args } = ArgParser.callback(fullArgs)
    const [getInfo = {}] = args

    DispatchManager.request(
      `${CRX_WINDOW_GET_ALL_}${this[privExtensionId]}`,
      [getInfo],
      (evt, err, response) => {
        if (callback) {
          const windows = (response || []).map((data) => new Window(data))
          callback(windows)
        }
      }
    )
  }
}

export default Windows
