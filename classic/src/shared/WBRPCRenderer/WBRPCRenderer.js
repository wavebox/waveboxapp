import WBRPCBrowserWindow from './WBRPCBrowserWindow'
import WBRPCWavebox from './WBRPCWavebox'
import WBRPCWebContents from './WBRPCWebContents'

const privBrowserWindow = Symbol('privBrowserWindow')
const privWavebox = Symbol('privWavebox')
const privWebContents = Symbol('privWebContents')

class WBRPCRenderer {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    if (process.type === 'browser') {
      throw new Error('WebContentsRPC is not supported in the browser thread')
    }

    this[privBrowserWindow] = new WBRPCBrowserWindow()
    this[privWavebox] = new WBRPCWavebox()
    this[privWebContents] = new WBRPCWebContents()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get browserWindow () { return this[privBrowserWindow] }
  get webContents () { return this[privWebContents] }
  get wavebox () { return this[privWavebox] }
}

export default new WBRPCRenderer()
