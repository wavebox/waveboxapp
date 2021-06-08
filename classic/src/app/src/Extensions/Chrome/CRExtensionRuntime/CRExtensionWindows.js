import { evtMain } from 'AppEvents'
import {
  CRX_WINDOW_FOCUS_CHANGED_,
  CRX_WINDOW_GET_ALL_
} from 'shared/crExtensionIpcEvents'
import WaveboxWindow from 'Windows/WaveboxWindow'
import CRDispatchManager from '../CRDispatchManager'
import CRExtensionWindow from './CRExtensionWindow'
import CRExtensionTab from './CRExtensionTab'

class CRExtensionWindows {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.backgroundPageSender = null
    this.extensionWindowSender = null

    if (this.extension.manifest.permissions.has('tabs')) {
      evtMain.on(evtMain.WB_WINDOW_BLURRED, this.handleWindowBlurred)
      evtMain.on(evtMain.WB_WINDOW_FOCUSED, this.handleWindowFocused)
    }

    CRDispatchManager.registerHandler(`${CRX_WINDOW_GET_ALL_}${this.extension.id}`, this.handleGetAllWindows)
  }

  destroy () {
    evtMain.removeListener(evtMain.WB_WINDOW_BLURRED, this.handleWindowBlurred)
    evtMain.removeListener(evtMain.WB_WINDOW_FOCUSED, this.handleWindowFocused)
    CRDispatchManager.unregisterHandler(`${CRX_WINDOW_GET_ALL_}${this.extension.id}`, this.handleGetAllWindows)
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @return the id of the focued window or undefined
  */
  _getFocusedWindowId () {
    const focused = WaveboxWindow.all().find((win) => win.isFocused())
    return focused ? focused.id : undefined
  }

  /**
  * Emits an event to all the qualified listeners
  * @param ...args: the arguments to pass through
  */
  _emitEventToListeners (...args) {
    if (this.backgroundPageSender) {
      this.backgroundPageSender(...args)
    }
    if (this.extensionWindowSender) {
      this.extensionWindowSender(...args)
    }
  }

  /* ****************************************************************************/
  // Event handlers: Window
  /* ****************************************************************************/

  /**
  * Handles a window becoming blurred
  * @param evt: the event that fired
  * @param windowId: the id of the window
  */
  handleWindowBlurred = (evt, windowId) => {
    const focusedId = this._getFocusedWindowId()
    this._emitEventToListeners(`${CRX_WINDOW_FOCUS_CHANGED_}${this.extension.id}`, focusedId === undefined ? -1 : focusedId)
  }

  /**
  * Handles a window becoming focused
  * @param evt: the event that fired
  * @param windowId: the id of the window
  */
  handleWindowFocused = (evt, windowId) => {
    this._emitEventToListeners(`${CRX_WINDOW_FOCUS_CHANGED_}${this.extension.id}`, windowId === undefined ? -1 : windowId)
  }

  /* ****************************************************************************/
  // Handlers
  /* ****************************************************************************/

  /**
  * Gets all the windows
  * @param evt: the event that fired
  * @param [getInfo]: the get info provided by the client
  * @param responseCallback: executed on completion
  */
  handleGetAllWindows = (evt, [getInfo], responseCallback) => {
    const windowTypesFilter = getInfo && getInfo.windowTypes
      ? new Set(getInfo.windowTypes)
      : undefined

    const windows = WaveboxWindow
      .allBrowserWindowIds()
      .map((bwId) => CRExtensionWindow.dataFromBrowserWindowId(this.extension, bwId))
      .filter((crxw) => windowTypesFilter ? windowTypesFilter.has(crxw.type) : true)

    const windowsWithTabs = getInfo && getInfo.populate === true
      ? windows.map((crxw) => {
        if (crxw.tabIds === undefined) { return crxw }
        return {
          ...crxw,
          tabs: crxw.tabIds.map((tabId) => {
            return CRExtensionTab.dataFromWebContentsId(this.extension, tabId)
          })
        }
      })
      : windows

    responseCallback(null, windowsWithTabs)
  }
}

export default CRExtensionWindows
