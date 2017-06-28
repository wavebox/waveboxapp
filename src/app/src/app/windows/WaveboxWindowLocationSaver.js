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
  * Saves the window state to disk
  */
  saveWindowScreenLocation () {
    clearTimeout(this.saver)
    this.saver = setTimeout(() => {
      if (!this.browserWindow || this.browserWindow.isDestroyed()) { return }
      if (this.browserWindow.isMinimized()) { return }
      const [x, y] = this.browserWindow.getPosition()
      const [width, height] = this.browserWindow.getSize()
      appStorage.setJSONItem(this.windowId, {
        fullscreen: this.browserWindow.isFullScreen(),
        maximized: this.browserWindow.isMaximized(),
        x: x,
        y: y,
        width: width,
        height: height
      })
    }, 2000)
  }

  /**
  * Loads the window state
  * @return the state
  */
  getSavedScreenLocation () {
    if (this.windowId) {
      return appStorage.getJSONItem(this.windowId, {})
    } else {
      return {}
    }
  }
}

module.exports = WaveboxWindowLocationSaver
