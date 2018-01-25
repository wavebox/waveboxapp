import { evtMain } from 'AppEvents'
import {
  CRX_WINDOW_FOCUS_CHANGED_
} from 'shared/crExtensionIpcEvents'
import WaveboxWindow from 'Windows/WaveboxWindow'

class CRExtensionWindows {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.backgroundPageSender = null

    if (this.extension.manifest.hasBackground) {
      if (this.extension.manifest.permissions.has('tabs')) {
        evtMain.on(evtMain.WB_WINDOW_BLURRED, this.handleWindowBlurred)
        evtMain.on(evtMain.WB_WINDOW_FOCUSED, this.handleWindowFocused)
      }
    }
  }

  destroy () {
    evtMain.removeListener(evtMain.WB_WINDOW_BLURRED, this.handleWindowBlurred)
    evtMain.removeListener(evtMain.WB_WINDOW_FOCUSED, this.handleWindowFocused)
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

  /* ****************************************************************************/
  // Event handlers: Window
  /* ****************************************************************************/

  /**
  * Handles a window becoming blurred
  * @param evt: the event that fired
  * @param windowId: the id of the window
  */
  handleWindowBlurred = (evt, windowId) => {
    if (!this.backgroundPageSender) { return }
    const focusedId = this._getFocusedWindowId()
    this.backgroundPageSender(`${CRX_WINDOW_FOCUS_CHANGED_}${this.extension.id}`, focusedId === undefined ? -1 : focusedId)
  }

  /**
  * Handles a window becoming focused
  * @param evt: the event that fired
  * @param windowId: the id of the window
  */
  handleWindowFocused = (evt, windowId) => {
    if (!this.backgroundPageSender) { return }
    this.backgroundPageSender(`${CRX_WINDOW_FOCUS_CHANGED_}${this.extension.id}`, windowId === undefined ? -1 : windowId)
  }
}

export default CRExtensionWindows
