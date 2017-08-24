const appStorage = require('../storage/appStorage')

class WaveboxWindowLocationSaver {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param browserWindow: the browser window to save state to and from
  * @param windowId = undefined: the id of the window
  */
  constructor (windowId = undefined) {
    this.saver = null
    this.browserWindow = null
    this.windowId = windowId
    this.cache = undefined
    this.boundSaveWindowScreenLocation = this.saveWindowScreenLocation.bind(this)
  }

  /* ****************************************************************************/
  // Registering
  /* ****************************************************************************/

  /**
  * Registers the listeners
  * @return this
  */
  register (browserWindow) {
    this.unregister()
    if (this.windowId) {
      this.browserWindow = browserWindow
      this.browserWindow.on('resize', this.boundSaveWindowScreenLocation)
      this.browserWindow.on('move', this.boundSaveWindowScreenLocation)
      this.browserWindow.on('maximize', this.boundSaveWindowScreenLocation)
      this.browserWindow.on('unmaximize', this.boundSaveWindowScreenLocation)
    }
    return this
  }

  /**
  * Unregisters the listeners
  * @param browserWindow = undefined: supply if you want to check it against the recorded browser window
  * @return this
  */
  unregister (browserWindow = undefined) {
    if (browserWindow !== undefined && this.browserWindow !== browserWindow) {
      return this
    }
    if (this.browserWindow) {
      this.browserWindow.removeListener('resize', this.boundSaveWindowScreenLocation)
      this.browserWindow.removeListener('move', this.boundSaveWindowScreenLocation)
      this.browserWindow.removeListener('maximize', this.boundSaveWindowScreenLocation)
      this.browserWindow.removeListener('unmaximize', this.boundSaveWindowScreenLocation)

      clearTimeout(this.saver)
      this.browserWindow = null
    }
    return this
  }

  /* ****************************************************************************/
  // Window state
  /* ****************************************************************************/

  /**
  * Gets the current window state
  * @return the current window state as an object, or undefined if not available at this time
  */
  getCurrentWindowState () {
    if (!this.browserWindow || this.browserWindow.isDestroyed()) { return undefined }
    if (this.browserWindow.isMinimized()) { return undefined }

    const [x, y] = this.browserWindow.getPosition()
    const [width, height] = this.browserWindow.getSize()
    return Object.freeze({
      fullscreen: this.browserWindow.isFullScreen(),
      maximized: this.browserWindow.isMaximized(),
      x: x,
      y: y,
      width: width,
      height: height
    })
  }

  /**
  * Saves the window state to disk
  */
  saveWindowScreenLocation () {
    if (!this.windowId) { return }

    // Make copies of variables for later use
    const windowId = this.windowId
    const state = this.getCurrentWindowState()
    if (!state) { return }

    // Store the state and queue for disk write
    this.cache = state
    clearTimeout(this.saver)
    this.saver = setTimeout(() => {
      appStorage.setJSONItem(windowId, state)
    }, 2000)
  }

  /**
  * Loads the window state
  * @return the state
  */
  getSavedScreenLocation () {
    if (this.windowId) {
      if (this.cache === undefined) {
        this.cache = appStorage.getJSONItem(this.windowId, {})
      }
      return this.cache
    } else {
      return {}
    }
  }
}

module.exports = WaveboxWindowLocationSaver
