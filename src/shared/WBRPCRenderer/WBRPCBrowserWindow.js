import { EventEmitter } from 'events'
import { ipcRenderer } from 'electron'
import {
  WBRPC_CLOSE_WINDOW,
  WBRPC_BW_FOCUS,
  WBRPC_IS_FOCUSED_SYNC
} from '../WBRPCEvents'

class WBRPCBrowserWindow extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    ipcRenderer.on(WBRPC_BW_FOCUS, this._handleWindowFocused)
  }

  /* ****************************************************************************/
  // Events
  /* ****************************************************************************/

  _handleWindowFocused = (evt, bwId, wcId) => {
    this.emit('focus', { senderId: bwId }, wcId)
  }

  /* ****************************************************************************/
  // Current window
  /* ****************************************************************************/

  /**
  * Attempts to close the current window
  */
  close () {
    ipcRenderer.send(WBRPC_CLOSE_WINDOW)
  }

  /**
  * Checks if the current window is focused
  * @return true if the window is focused, false otherwise
  */
  isFocusedSync () {
    return ipcRenderer.sendSync(WBRPC_IS_FOCUSED_SYNC)
  }
}

export default WBRPCBrowserWindow
