const appStorage = require('../storage/appStorage')
const ClassTools = require('../ClassTools')

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
    ClassTools.autobindFunctions(this, ['saveWindowScreenLocation'])
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
      this.browserWindow.on('resize', this.saveWindowScreenLocation)
      this.browserWindow.on('move', this.saveWindowScreenLocation)
      this.browserWindow.on('maximize', this.saveWindowScreenLocation)
      this.browserWindow.on('unmaximize', this.saveWindowScreenLocation)
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
      this.browserWindow.removeListener('resize', this.saveWindowScreenLocation)
      this.browserWindow.removeListener('move', this.saveWindowScreenLocation)
      this.browserWindow.removeListener('maximize', this.saveWindowScreenLocation)
      this.browserWindow.removeListener('unmaximize', this.saveWindowScreenLocation)

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

  /**
  * @return true if there is a saved screen location
  */
  hasSavedScreenLocation () {
    if (!this.windowId) { return false }
    return Object.keys(this.getSavedScreenLocation()).length > 0
  }

  /**
  * Re-applies a screen location
  * @param location: the location to reapply
  */
  reapplySavedScreenLocation (location) {
    if (!this.windowId) { return }
    if (!location || Object.keys(location).length === 0) { return }
    if (!this.browserWindow || this.browserWindow.isDestroyed()) { return }

    this.browserWindow.setBounds(location, false)
    if (location.maximized) { this.browserWindow.maximize() }
  }
}

module.exports = WaveboxWindowLocationSaver
