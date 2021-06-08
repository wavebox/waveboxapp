import { app } from 'electron'
import WBRPCBrowserWindow from './WBRPCBrowserWindow'
import WBRPCWavebox from './WBRPCWavebox'
import WBRPCWebContents from './WBRPCWebContents'

const privConnected = Symbol('privConnected')
const privBrowserWindowRPC = Symbol('privBrowserWindowRPC')
const privWaveboxRPC = Symbol('privWaveboxRPC')
const privWebContentsRPC = Symbol('privWebContentsRPC')

class WBRPCService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param notificationService: the notification service
  */
  constructor (notificationService) {
    this[privConnected] = new Set()
    this[privBrowserWindowRPC] = new WBRPCBrowserWindow()
    this[privWaveboxRPC] = new WBRPCWavebox(notificationService)
    this[privWebContentsRPC] = new WBRPCWebContents()

    app.on('web-contents-created', this._handleWebContentsCreated)
  }

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  /**
  * Handles a webcontents being created by binding the event pass-throughs to it
  * @param evt: the event that fired
  * @param contents: the contents that were created
  */
  _handleWebContentsCreated = (evt, contents) => {
    setImmediate(() => {
      if (contents.isDestroyed()) { return }
      const webContentsId = contents.id
      if (this[privConnected].has(webContentsId)) { return }
      this[privConnected].add(webContentsId)

      this[privBrowserWindowRPC].connect(contents)
      this[privWaveboxRPC].connect(contents)
      this[privWebContentsRPC].connect(contents)

      contents.on('destroyed', () => {
        this[privConnected].delete(webContentsId)
        this[privBrowserWindowRPC].disconnect(webContentsId)
        this[privWaveboxRPC].disconnect(webContentsId)
        this[privWebContentsRPC].disconnect(webContentsId)
      })
    })
  }
}

export default WBRPCService
