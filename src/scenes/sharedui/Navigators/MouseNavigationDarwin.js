import {
  WB_WINDOW_DARWIN_SCROLL_TOUCH_BEGIN,
  WB_WINDOW_DARWIN_SCROLL_TOUCH_END
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

const REQUIRED_VELOCITY = 100

class MouseNavigationDarwin {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (backFn, forwardFn) {
    if (process.platform !== 'darwin') {
      throw new Error('MouseNavigationDarwin is only supported on Darwin')
    }

    this.backFn = backFn
    this.forwardFn = forwardFn
    this.__isRegistered__ = false
    this.__scrolling__ = false
    this.__shouldNavigateDirection__ = 0
  }

  register () {
    if (this.__isRegistered__) { return }

    ipcRenderer.on(WB_WINDOW_DARWIN_SCROLL_TOUCH_BEGIN, this._handleTouchBegin)
    ipcRenderer.on(WB_WINDOW_DARWIN_SCROLL_TOUCH_END, this._handleTouchEnd)
    window.addEventListener('mousewheel', this._handleMousewheel)
  }

  unregister () {
    if (!this.__isRegistered__) { return }

    ipcRenderer.removeListener(WB_WINDOW_DARWIN_SCROLL_TOUCH_BEGIN, this._handleTouchBegin)
    ipcRenderer.removeListener(WB_WINDOW_DARWIN_SCROLL_TOUCH_END, this._handleTouchEnd)
    window.removeEventListener('mousewheel', this._handleMousewheel)
  }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  /**
  * Handles the touch begin event
  */
  _handleTouchBegin = () => {
    this.__scrolling__ = true
  }

  /**
  * Handles the touch end event
  */
  _handleTouchEnd = () => {
    if (this.__shouldNavigateDirection__ === -1) {
      this.backFn()
    } else if (this.__shouldNavigateDirection__ === 1) {
      this.forwardFn()
    }
    this.__scrolling__ = false
    this.__shouldNavigateDirection__ = 0
  }

  /**
  * Handles the mousewheel event
  */
  _handleMousewheel = (evt) => {
    if (!this.__scrolling__) { return }
    if (evt.deltaX > REQUIRED_VELOCITY) {
      this.__shouldNavigateDirection__ = 1
    } else if (evt.deltaX < -REQUIRED_VELOCITY) {
      this.__shouldNavigateDirection__ = -1
    }
  }
}

export default MouseNavigationDarwin
