import { ipcRenderer } from 'electron'
import {
  WBRPC_CLOSE_WINDOW
} from '../WBRPCEvents'

class WBRPCBrowserWindow {
  /* ****************************************************************************/
  // Current window
  /* ****************************************************************************/

  close () {
    ipcRenderer.send(WBRPC_CLOSE_WINDOW)
  }
}

export default WBRPCBrowserWindow
