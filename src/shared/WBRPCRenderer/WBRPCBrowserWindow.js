import { EventEmitter } from 'events'
import { ipcRenderer } from 'electron'
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
} from '../WBRPCEvents'

class WBRPCBrowserWindow extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    ipcRenderer.on(WBRPC_BWE_FOCUS, this._handleWindowFocused)
    ipcRenderer.on(WBRPC_BWE_BLUR, this._handleWindowBlurred)
    ipcRenderer.on(WBRPC_BWE_ENTER_FULL_SCREEN, this._handleEnterFullScreen)
    ipcRenderer.on(WBRPC_BWE_LEAVE_FULL_SCREEN, this._handleLeaveFullScreen)
    ipcRenderer.on(WBRPC_BWE_MAXIMIZE, this._handleMaximize)
    ipcRenderer.on(WBRPC_BWE_UNMAXIMIZE, this._handleUnmaximize)
    ipcRenderer.on(WBRPC_BWE_DARK_MODE_CHANGED, this._handleDarkModeChanged)
  }

  /* ****************************************************************************/
  // Events
  /* ****************************************************************************/

  _handleWindowFocused = (evt, bwId, wcId) => {
    this.emit('focus', { senderId: bwId, webContentsId: wcId })
  }

  _handleWindowBlurred = (evt, bwId, wcId) => {
    this.emit('blur', { senderId: bwId, webContentsId: wcId })
  }

  _handleEnterFullScreen = (evt, bwId, wcId) => {
    this.emit('enter-full-screen', { senderId: bwId, webContentsId: wcId })
  }

  _handleLeaveFullScreen = (evt, bwId, wcId) => {
    this.emit('leave-full-screen', { senderId: bwId, webContentsId: wcId })
  }

  _handleMaximize = (evt, bwId, wcId) => {
    this.emit('maximize', { senderId: bwId, webContentsId: wcId })
  }
  _handleUnmaximize = (evt, bwId, wcId) => {
    this.emit('unmaximize', { senderId: bwId, webContentsId: wcId })
  }

  _handleDarkModeChanged = (evt, bwId, wcId, isDarkMode) => {
    this.emit('dark-mode-changed', { senderId: bwId, webContentsId: wcId }, isDarkMode)
  }

  /* ****************************************************************************/
  // Current window
  /* ****************************************************************************/

  /**
  * Closes the current window
  */
  close () {
    ipcRenderer.send(WBRPC_BW_CLOSE)
  }

  /**
  * Minimizes the current window
  */
  minimize () {
    ipcRenderer.send(WBRPC_BW_MINIMIZE)
  }

  /**
  * Maximizes the current window
  */
  maximize () {
    ipcRenderer.send(WBRPC_BW_MAXIMIZE)
  }

  /**
  * Unmaximizes the current window
  */
  unmaximize () {
    ipcRenderer.send(WBRPC_BW_UNMAXIMIZE)
  }

  /**
  * Sets the fullscreen state of the current window
  * @param fullscreen: true for fullscreen
  */
  setFullScreen (fullscreen) {
    ipcRenderer.send(WBRPC_BW_SET_FULL_SCREEN, fullscreen)
  }

  /**
  * Checks if the current window is focused
  * @return true if the window is focused, false otherwise
  */
  isFocusedSync () {
    return ipcRenderer.sendSync(WBRPC_BW_IS_FOCUSED_SYNC)
  }

  /**
  * Checks if the current window is maximized
  * @return true if the window is focused, false otherwise
  */
  isMaximizedSync () {
    return ipcRenderer.sendSync(WBRPC_BW_IS_MAXIMIZED_SYNC)
  }

  /**
  * Checks if the current window is fullscreen
  * @return true if the window is focused, false otherwise
  */
  isFullScreenSync () {
    return ipcRenderer.sendSync(WBRPC_BW_IS_FULL_SCREEN_SYNC)
  }

  /**
  * Checks if the current window should be in dark mode
  * @return true if dark mode is enabled, false otherwise
  */
  isDarkModeSync () {
    return ipcRenderer.sendSync(WBRPC_BW_IS_DARK_MODE_SYNC)
  }
}

export default WBRPCBrowserWindow
