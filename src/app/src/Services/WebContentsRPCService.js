import { app, ipcMain, BrowserWindow, dialog, webContents } from 'electron'
import { ElectronWebContents } from 'ElectronTools'
import {
  WCRPC_DOM_READY,
  WCRPC_CLOSE_WINDOW,
  WCRPC_SEND_INPUT_EVENT,
  WCRPC_SEND_INPUT_EVENTS,
  WCRPC_SHOW_ASYNC_MESSAGE_DIALOG,
  WCRPC_SYNC_GET_OPENER_INFO
} from 'shared/webContentsRPC'

const privConnected = Symbol('privConnected')

class WebContentsRPCService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConnected] = new Set()
    app.on('web-contents-created', this._handleWebContentsCreated)
    ipcMain.on(WCRPC_CLOSE_WINDOW, this._handleCloseWindow)
    ipcMain.on(WCRPC_SEND_INPUT_EVENT, this._handleSendInputEvent)
    ipcMain.on(WCRPC_SEND_INPUT_EVENTS, this._handleSendInputEvents)
    ipcMain.on(WCRPC_SHOW_ASYNC_MESSAGE_DIALOG, this._handleShowAsyncMessageDialog)
    ipcMain.on(WCRPC_SYNC_GET_OPENER_INFO, this._handleSyncGetOpenerInfo)
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

      contents.on('dom-ready', this._handleDomReady)
      contents.on('destroyed', () => {
        this[privConnected].delete(webContentsId)
      })
    })
  }

  /* ****************************************************************************/
  // Web Content events
  /* ****************************************************************************/

  _handleDomReady = (evt) => {
    evt.sender.send(WCRPC_DOM_READY, evt.sender.id)
  }

  /* ****************************************************************************/
  // IPC Events
  /* ****************************************************************************/

  /**
  * Closes the browser window
  * @param evt: the event that fired
  */
  _handleCloseWindow = (evt) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    if (!bw) { return }
    bw.close()
  }

  /**
  * Sends an input event to the webcontents
  * @param evt: the event that fired
  * @param inputEvent: the input event to send
  */
  _handleSendInputEvent = (evt, inputEvent) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    evt.sender.sendInputEvent(inputEvent)
  }

  /**
  * Sends a set of input events to the webcontents
  * @param evt: the event that fired
  * @param inputEvents: the input event to send
  */
  _handleSendInputEvents = (evt, inputEvents) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    inputEvents.forEach((inputEvent) => {
      evt.sender.sendInputEvent(inputEvent)
    })
  }

  /**
  * Shows an async message dialog
  * @param evt: the event that fired
  * @param options: the options for the dialog
  */
  _handleShowAsyncMessageDialog = (evt, options) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    dialog.showMessageBox(bw, options)
  }

  /**
  * Synchronously gets the opener url from the webpreferences
  * @param evt: the event that fired
  */
  _handleSyncGetOpenerInfo = (evt) => {
    if (!this[privConnected].has(evt.sender.id)) { return }

    const webPref = evt.sender.getWebPreferences()
    if (webPref.openerId === undefined) {
      evt.returnValue = { hasOpener: false }
    } else {
      const opener = webContents.fromId(webPref.openerId)
      if (!opener) {
        evt.returnValue = { hasOpener: false }
      } else {
        evt.returnValue = { hasOpener: true, url: opener.getURL(), openerId: webPref.openerId }
      }
    }
  }
}

export default WebContentsRPCService
