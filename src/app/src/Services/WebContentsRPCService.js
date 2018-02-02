import { app, ipcMain, BrowserWindow, dialog, webContents } from 'electron'
import { ElectronWebContents } from 'ElectronTools'
import {
  WCRPC_DOM_READY,
  WCRPC_CLOSE_WINDOW,
  WCRPC_GUEST_CLOSE_WINDOW,
  WCRPC_SEND_INPUT_EVENT,
  WCRPC_SEND_INPUT_EVENTS,
  WCRPC_SHOW_ASYNC_MESSAGE_DIALOG,
  WCRPC_SYNC_GET_OPENER_INFO,
  WCRPC_DID_GET_REDIRECT_REQUEST
} from 'shared/webContentsRPC'
import { ELEVATED_LOG_PREFIX } from 'shared/constants'
import WaveboxWindow from 'Windows/WaveboxWindow'

const privConnected = Symbol('privConnected')

class WebContentsRPCService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConnected] = new Set()
    app.on('web-contents-created', this._handleWebContentsCreated)
    ipcMain.on(WCRPC_CLOSE_WINDOW, this._handleCloseWindow)
    ipcMain.on(WCRPC_GUEST_CLOSE_WINDOW, this._handleGuestCloseWindow)
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
      contents.on('console-message', this._handleConsoleMessage)
      contents.on('will-prevent-unload', this._handleWillPreventUnload)
      contents.on('did-get-redirect-request', this._handleDidGetRedirectRequest)
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

  _handleConsoleMessage = (evt, level, message, line, sourceId) => {
    if (message.startsWith(ELEVATED_LOG_PREFIX)) {
      const logArgs = [
        '[ELEVATED LOG]',
        `sender=${evt.sender.id}`,
        `line=${line}`,
        `sourceId=${sourceId}`,
        message
      ]
      switch (level) {
        case 1: console.warn(...logArgs); break
        case 2: console.error(...logArgs); break
        default: console.log(...logArgs); break
      }
    }
  }

  _handleWillPreventUnload = (evt) => {
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    if (!bw || bw.isDestroyed()) { return }

    const choice = dialog.showMessageBox(bw, {
      type: 'question',
      buttons: ['Leave', 'Stay'],
      title: '',
      message: 'Do you want to leave this site?',
      detail: 'Changes you made may not be saved.',
      defaultId: 0,
      cancelId: 1
    })
    if (choice === 0) {
      evt.preventDefault()
    }
  }

  _handleDidGetRedirectRequest = (evt, prevUrl, nextUrl, isMainFrame, httpResponseCode, requestMethod, referrer, headers) => {
    evt.sender.send(WCRPC_DID_GET_REDIRECT_REQUEST, evt.sender.id, prevUrl, nextUrl, isMainFrame, httpResponseCode, requestMethod, referrer, headers)
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
    if (!bw || bw.isDestroyed()) { return }
    bw.close()
  }

  /**
  * Closes the browser window as a guest request
  * @param evt: the event that fired
  */
  _handleGuestCloseWindow = (evt) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    if (!bw || bw.isDestroyed()) { return }
    const waveboxWindow = WaveboxWindow.fromBrowserWindow(bw)
    if (!waveboxWindow || !waveboxWindow.allowsGuestClosing) { return }
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
    dialog.showMessageBox(bw, options, () => {
      /* no-op */
    })
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
