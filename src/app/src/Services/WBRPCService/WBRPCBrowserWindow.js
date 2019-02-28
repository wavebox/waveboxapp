import { ipcMain, webContents, BrowserWindow, systemPreferences } from 'electron'
import { ElectronWebContents } from 'ElectronTools'
import {
  WBRPC_BW_CLOSE,
  WBRPC_BW_MINIMIZE,
  WBRPC_BW_MAXIMIZE,
  WBRPC_BW_UNMAXIMIZE,
  WBRPC_BW_SET_FULL_SCREEN,
  WBRPC_BW_IS_FOCUSED_SYNC,
  WBRPC_BW_IS_MAXIMIZED_SYNC,
  WBRPC_BW_IS_FULL_SCREEN_SYNC,
  WBRPC_BW_IS_DARK_MODE_SYNC,
  WBRPC_BWE_FOCUS,
  WBRPC_BWE_BLUR,
  WBRPC_BWE_ENTER_FULL_SCREEN,
  WBRPC_BWE_LEAVE_FULL_SCREEN,
  WBRPC_BWE_MAXIMIZE,
  WBRPC_BWE_UNMAXIMIZE,
  WBRPC_BWE_DARK_MODE_CHANGED
} from 'shared/WBRPCEvents'

const privConnected = Symbol('privConnected')

class WBRPCBrowserWindow {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConnected] = new Set()
    ipcMain.on(WBRPC_BW_CLOSE, this._handleCloseWindow)
    ipcMain.on(WBRPC_BW_MINIMIZE, this._handleMinimizeWindow)
    ipcMain.on(WBRPC_BW_MAXIMIZE, this._handleMaximizeWindow)
    ipcMain.on(WBRPC_BW_UNMAXIMIZE, this._handleUnmaximizeWindow)
    ipcMain.on(WBRPC_BW_SET_FULL_SCREEN, this._handleSetWindowFullScreen)
    ipcMain.on(WBRPC_BW_IS_FOCUSED_SYNC, this._handleIsFocusedSync)
    ipcMain.on(WBRPC_BW_IS_MAXIMIZED_SYNC, this._handleIsMaximized)
    ipcMain.on(WBRPC_BW_IS_FULL_SCREEN_SYNC, this._handleIsFullScreenSync)
    ipcMain.on(WBRPC_BW_IS_DARK_MODE_SYNC, this._handleIsDarkModeSync)

    if (process.platform === 'darwin') {
      systemPreferences.subscribeNotification(
        'AppleInterfaceThemeChangedNotification', this._handleDarwinThemeChanged
      )
    }
  }

  /**
  * Connects the webcontents
  * @param contents: the webcontents to connect
  */
  connect (contents) {
    this[privConnected].add(contents.id)

    const bw = BrowserWindow.fromWebContents(contents)
    if (bw) {
      bw.on('focus', this._handleFocus)
      bw.on('blur', this._handleBlur)
      bw.on('enter-full-screen', this._handleEnterFullScreen)
      bw.on('leave-full-screen', this._handleLeaveFullScreen)
      bw.on('maximize', this._handleMaximize)
      bw.on('unmaximize', this._handleUnmaximize)
    }
  }

  /**
  * Disconnects a webcontents
  * @param contentsId: the id of the webcontents that has been disconnected
  */
  disconnect (contentsId) {
    this[privConnected].delete(contentsId)
  }

  /* ****************************************************************************/
  // Browser window events
  /* ****************************************************************************/

  _handleFocus = (evt) => {
    evt.sender.webContents.send(WBRPC_BWE_FOCUS, evt.sender.id, evt.sender.webContents.id)
  }

  _handleBlur = (evt) => {
    evt.sender.webContents.send(WBRPC_BWE_BLUR, evt.sender.id, evt.sender.webContents.id)
  }

  _handleEnterFullScreen = (evt) => {
    evt.sender.webContents.send(WBRPC_BWE_ENTER_FULL_SCREEN, evt.sender.id, evt.sender.webContents.id)
  }

  _handleLeaveFullScreen = (evt) => {
    evt.sender.webContents.send(WBRPC_BWE_LEAVE_FULL_SCREEN, evt.sender.id, evt.sender.webContents.id)
  }

  _handleMaximize = (evt) => {
    evt.sender.webContents.send(WBRPC_BWE_MAXIMIZE, evt.sender.id, evt.sender.webContents.id)
  }
  _handleUnmaximize = (evt) => {
    evt.sender.webContents.send(WBRPC_BWE_UNMAXIMIZE, evt.sender.id, evt.sender.webContents.id)
  }

  /* ****************************************************************************/
  // System preferences events
  /* ****************************************************************************/

  _handleDarwinThemeChanged = () => {
    this[privConnected].forEach((wcId) => {
      const wc = webContents.fromId(wcId)
      const bw = BrowserWindow.fromWebContents(wc)
      if (wc && bw) {
        wc.send(WBRPC_BWE_DARK_MODE_CHANGED, bw.id, wcId, systemPreferences.isDarkMode())
      }
    })
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
  * Minimizes the browser window
  * @param evt: the event that fired
  */
  _handleMinimizeWindow = (evt) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    if (!bw || bw.isDestroyed()) { return }
    bw.minimize()
  }

  /**
  * Maximizes the browser window
  * @param evt: the event that fired
  */
  _handleMaximizeWindow = (evt) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    if (!bw || bw.isDestroyed()) { return }
    bw.maximize()
  }

  /**
  * Unmaximizes the browser window
  * @param evt: the event that fired
  */
  _handleUnmaximizeWindow = (evt) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    if (!bw || bw.isDestroyed()) { return }
    bw.unmaximize()
  }

  /**
  * Sets the window fullscreen state
  * @param evt: the event that fired
  * @param fullscreen: true for fullscreen, false otherwise
  */
  _handleSetWindowFullScreen = (evt, fullscreen) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
    if (!bw || bw.isDestroyed()) { return }
    bw.setFullScreen(fullscreen)
  }

  /**
  * Checks if the current window is focused
  * @param evt: the event that fired
  */
  _handleIsFocusedSync = (evt) => {
    try {
      const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
      if (!bw || bw.isDestroyed()) {
        evt.returnValue = false
      } else {
        evt.returnValue = bw.isFocused()
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_BW_IS_FOCUSED_SYNC}" continuing with unknown side effects`, ex)
      evt.returnValue = false
    }
  }

  /**
  * Checks if the current window is maximized
  * @param evt: the event that fired
  */
  _handleIsMaximized = (evt) => {
    try {
      const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
      if (!bw || bw.isDestroyed()) {
        evt.returnValue = false
      } else {
        evt.returnValue = bw.isMaximized()
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_BW_IS_MAXIMIZED_SYNC}" continuing with unknown side effects`, ex)
      evt.returnValue = false
    }
  }

  /**
  * Checks if the current window is fullscreen
  * @param evt: the event that fired
  */
  _handleIsFullScreenSync = (evt) => {
    try {
      const bw = BrowserWindow.fromWebContents(ElectronWebContents.rootWebContents(evt.sender))
      if (!bw || bw.isDestroyed()) {
        evt.returnValue = false
      } else {
        evt.returnValue = bw.isFullScreen()
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_BW_IS_FULL_SCREEN_SYNC}" continuing with unknown side effects`, ex)
      evt.returnValue = false
    }
  }

  /**
  * Checks if we should use the dark mode
  * @param evt: the event that fired
  */
  _handleIsDarkModeSync = (evt) => {
    try {
      evt.returnValue = systemPreferences.isDarkMode()
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_BW_IS_DARK_MODE_SYNC}" continuing with unknown side effects`, ex)
      evt.returnValue = false
    }
  }
}

export default WBRPCBrowserWindow
