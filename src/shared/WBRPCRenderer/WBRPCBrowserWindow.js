import { EventEmitter } from 'events'
import { ipcRenderer } from 'electron'
import {
  WBRPC_CLOSE_WINDOW,
  WBRPC_BW_FOCUS
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
    this.emit('focus', bwId, wcId)
  }

  /* ****************************************************************************/
  // Current window
  /* ****************************************************************************/

  close () {
    ipcRenderer.send(WBRPC_CLOSE_WINDOW)
  }
}

export default WBRPCBrowserWindow
