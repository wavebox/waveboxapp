import appStorage from 'Storage/appStorage'

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
  saveWindowScreenLocation = () => {
    if (!this.windowId) { return }

    // Make copies of variables for later use
    const windowId = this.windowId
    let state = this.getCurrentWindowState()
    if (!state) { return }

    // If we're fullscreen or maximized only partially save the state
    if (state.fullscreen || state.maximized) {
      state = {
        ...this.getSavedScreenLocation(),
        fullscreen: state.fullscreen,
        maximized: state.maximized
      }
    }

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
  * Shows the window with the saved screen location. If no screen location is
  * found, still shows the window but in whatever state the OS wants to show it
  * in. If there is no window then just does nothing
  * @param location=this.getSavedScreenLocation(): the location to apply
  * @return true if a saved location was used, false otherwise or if the window is not available
  */
  showWithSavedScreenLocation (location = this.getSavedScreenLocation()) {
    if (!this.windowId) { return false }
    if (!this.browserWindow || this.browserWindow.isDestroyed()) { return false }
    if (!location || Object.keys(location).length === 0) {
      this.browserWindow.show()
      return false
    }

    if (location.maximized) {
      // maximize() Will automatically show the window if not maximized already.
      // Calling show() first will show the window in a non-maximized state and
      // cause visual a jitter as it resizes
      if (this.browserWindow.isMaximized()) {
        this.browserWindow.show()
      } else {
        this.browserWindow.maximize()
      }
      return true
    } else {
      this.browserWindow.show()
      this.browserWindow.setBounds(location, false)
      return true
    }
  }
}

export default WaveboxWindowLocationSaver
