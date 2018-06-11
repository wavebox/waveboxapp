import { BrowserWindow, webContents, screen } from 'electron'
import EventEmitter from 'events'
import { evtMain } from 'AppEvents'
import { settingsStore } from 'stores/settings'
import WaveboxWindowLocationSaver from './WaveboxWindowLocationSaver'
import WaveboxWindowManager from './WaveboxWindowManager'
import {
  WB_WINDOW_FIND_START,
  WB_WINDOW_FIND_NEXT,
  WB_WINDOW_DARWIN_SCROLL_TOUCH_BEGIN,
  WB_WINDOW_DARWIN_SCROLL_TOUCH_END,
  WB_WINDOW_FOCUS,
  WB_WINDOW_BLUR
} from 'shared/ipcEvents'
import Resolver from 'Runtime/Resolver'
import WINDOW_TYPES from './WindowTypes'

const privWindow = Symbol('privWindow')
const privBrowserWindowId = Symbol('privBrowserWindowId')
const privLocationSaver = Symbol('privLocationSaver')
const privLastTimeInFocus = Symbol('privLastTimeInFocus')

const waveboxWindowManager = new WaveboxWindowManager()

class WaveboxWindow extends EventEmitter {
  /* ****************************************************************************/
  // Class: Window Manager Passthroughs
  /* ****************************************************************************/

  static all () { return waveboxWindowManager.all() }
  static allOfType (Constructor) { return waveboxWindowManager.allOfType(Constructor) }
  static getOfType (Constructor) { return waveboxWindowManager.getOfType(Constructor) }
  static lastFocused () { return waveboxWindowManager.lastFocused() }
  static lastFocusedId (includeSpecial) { return waveboxWindowManager.lastFocusedId(includeSpecial) }
  static focused () { return waveboxWindowManager.focused() }
  static fromWebContentsId (wcId) { return waveboxWindowManager.fromWebContentsId(wcId) }
  static allTabIds () { return waveboxWindowManager.allTabIds() }
  static fromTabId (tabId) { return waveboxWindowManager.fromTabId(tabId) }
  static tabMetaInfo (tabId) { return waveboxWindowManager.tabMetaInfo(tabId) }
  static allBrowserWindowIds () { return waveboxWindowManager.allBrowserWindowIds() }
  static fromBrowserWindowId (browserWindowId) { return waveboxWindowManager.fromBrowserWindowId(browserWindowId) }
  static fromBrowserWindow (bw) { return waveboxWindowManager.fromBrowserWindow(bw) }
  static focusedTabId () { return waveboxWindowManager.focusedTabId() }
  static cycleNextWindow () { return waveboxWindowManager.cycleNextWindow() }
  static attachSpecial (browserWindowId) { return waveboxWindowManager.attachSpecial(browserWindowId) }
  static detachSpecial (browserWindowId) { return waveboxWindowManager.detachSpecial(browserWindowId) }

  /* ****************************************************************************/
  // Class: Properties
  /* ****************************************************************************/

  static get WINDOW_TYPES () { return WINDOW_TYPES }
  static get windowType () { return WINDOW_TYPES.NONE }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param saverTag = undefined: the tag to use when saving the window position
  */
  constructor (saverTag = undefined) {
    super()

    this[privWindow] = null
    this[privBrowserWindowId] = null
    this[privLastTimeInFocus] = 0
    this[privLocationSaver] = new WaveboxWindowLocationSaver(saverTag)
  }

  /**
  * The default window preferences
  * @return the settings
  */
  defaultBrowserWindowPreferences () {
    let icon
    if (process.platform === 'win32') {
      icon = Resolver.icon('app.ico')
    } else if (process.platform === 'linux') {
      icon = Resolver.icon('app.png')
    }

    return {
      title: 'Wavebox',
      icon: icon
    }
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get WINDOW_TYPES () { return this.constructor.WINDOW_TYPES }
  get windowType () { return this.constructor.windowType }

  /* ****************************************************************************/
  // Properties: Window
  /* ****************************************************************************/

  get window () { return this[privWindow] }
  get browserWindowId () { return this[privBrowserWindowId] }
  get rootWebContents () {
    const has = this[privWindow] && !this[privWindow].isDestroyed() && this[privWindow].webContents
    return has ? this[privWindow].webContents : undefined
  }
  get rootWebContentsId () {
    const rootWebContents = this.rootWebContents
    return rootWebContents && !rootWebContents.isDestroyed() ? rootWebContents.id : undefined
  }
  get locationSaver () { return this[privLocationSaver] }
  get lastTimeInFocus () { return this[privLastTimeInFocus] }

  /* ****************************************************************************/
  // Properties: Behaviour
  /* ****************************************************************************/

  get rootWebContentsHasContextMenu () { return true }
  get allowsGuestClosing () { return false }

  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Starts the app
  * @param url = undefined: the start url
  * @param browserWindowPreferences = {}: preferences to pass to the browser window
  * @return this
  */
  create (url, browserWindowPreferences = {}) {
    const savedLocation = this.locationSaver.getSavedScreenLocation()
    const fullBrowserWindowPreferences = {
      ...this.defaultBrowserWindowPreferences(),
      ...browserWindowPreferences,
      ...savedLocation,
      // Setting fullscreen on launch has some funny effects particularly on macOS. Window
      // controls are not rendered. Window is draggable. wavebox/waveboxapp/#616
      fullscreen: undefined,
      maximized: undefined
    }

    // Create the window & prep for lifecycle
    this[privWindow] = new BrowserWindow(fullBrowserWindowPreferences)
    this[privBrowserWindowId] = this.window.id
    this[settingsStore.getState().ui.showAppMenu ? 'showAppMenu' : 'hideAppMenu']()

    // Bind window event listeners
    this.window.on('close', (evt) => this.emit('close', evt))
    this.window.on('closed', (evt) => this.destroy(evt))
    this.window.on('focus', this._handleWindowFocused)
    this.window.on('blur', this._handleWindowBlurred)
    this.bindMouseNavigation()

    // Restore window position
    if (fullBrowserWindowPreferences.show) {
      this._restoreWindowPosition(savedLocation)
    } else {
      this.window.once('ready-to-show', (evt) => {
        // Defer this as we may be showing the window hidden and choosing
        // to show on this callback. Do this to to ensure we are the last
        // callback and we have the most up to date state
        setImmediate(() => {
          this._restoreWindowPosition(savedLocation)
        })
      })
    }

    // Register state savers
    this.locationSaver.register(this.window)

    // Bind other change listeners
    settingsStore.listen(this.updateWindowMenubar)

    // Load the start url
    if (url !== undefined && url !== '' && url !== 'about:blank') {
      this.window.loadURL(url)
    }

    // Bind webcontents event listeners
    this.window.webContents.on('will-navigate', this._handleWillNavigate)

    // Global registers
    waveboxWindowManager.attach(this)
    setTimeout(() => { // Requeue to happen on setup complete
      evtMain.emit(evtMain.WB_WINDOW_CREATED, {}, this.browserWindowId)
    })

    return this
  }

  /**
  * Restores the window position
  * @param savedLocation: the previous saved location
  */
  _restoreWindowPosition (savedLocation) {
    if (this[privWindow]) {
      // Restore maximize seperately from the saved location as it can't be set in the launch args
      if (savedLocation.maximized === true) {
        this[privWindow].maximize()
      }
      // Restore fullscreen seperately to circumvent odd behaviour, particularly on macOS. Window
      // controls are not rendered. Window is draggable. wavebox/waveboxapp/#616
      if (savedLocation.fullscreen === true) {
        this[privWindow].setFullScreen(true)
      }

      // Bound the window to our current screen to ensure it's not off-screen
      if (!this[privWindow].isMaximized() && !this[privWindow].isFullScreen()) {
        const windowBounds = this[privWindow].getBounds()
        const workArea = (screen.getDisplayMatching(windowBounds) || screen.getPrimaryDisplay()).workArea
        // On macOS if the opening window is in fullscreen mode we can end up with Y=0 for the workarea. We
        // can also end up with screen.getMenuBarHeight()=0 as the menu bar is hidden. This can result in
        // the bounding failing and the window titlebar being placed under the menubar which means the
        // user can't move the window. Guard against this by adding an arbituary 22 (barHeight=22).
        // In means we can waste some space at the top of the screen, but better than being unusable
        // wavebox/waveboxapp/#388 wavebox/waveboxapp/#607
        const workAreaY1 = process.platform === 'darwin' ? Math.max(workArea.y, 22) : workArea.y
        const workAreaY2 = workAreaY1 + workArea.height
        const workAreaX1 = workArea.x
        const workAreaX2 = workArea.x + workArea.width

        let readjust = false
        if (windowBounds.y <= workAreaY1) {
          readjust = true // Window top above screen
        } else if (windowBounds.y >= workAreaY2) {
          readjust = true // Window below screen
        } else if (windowBounds.x + windowBounds.width <= workAreaX1) {
          readjust = true // Window to left of screen
        } else if (windowBounds.x >= workAreaX2) {
          readjust = true // Window to right of screen
        }

        if (readjust) {
          this[privWindow].center()
        }
      }
    }
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroy (evt) {
    settingsStore.unlisten(this.updateWindowMenubar)
    if (this.window) {
      this.locationSaver.unregister(this.window)
      if (!this.window.isDestroyed()) {
        this.window.close()
        this.window.destroy()
      }
      this[privWindow] = null
    }

    // Global registers
    waveboxWindowManager.detach(this)
    setTimeout(() => {
      evtMain.emit(evtMain.WB_WINDOW_DESTROYED, {}, this.browserWindowId)
    })
    this.emit('closed', evt)
  }

  /* ****************************************************************************/
  // Overwritable behaviour
  /* ****************************************************************************/

  /**
  * Checks if the webcontents is allowed to navigate to the next url. If false is returned
  * it will be prevented
  * @param evt: the event that fired
  * @param browserWindow: the browserWindow that's being checked
  * @param nextUrl: the next url to navigate
  * @return false to suppress, true to allow
  */
  allowNavigate (evt, browserWindow, nextUrl) {
    return false
  }

  /* ****************************************************************************/
  // Mouse Navigation
  /* ****************************************************************************/

  /**
  * Binds the mouse navigation shortcuts
  * Darwin is handled in the rendering thread
  */
  bindMouseNavigation () {
    if (process.platform === 'darwin') {
      this.window.on('scroll-touch-begin', () => {
        this.window.webContents.send(WB_WINDOW_DARWIN_SCROLL_TOUCH_BEGIN, {})
      })
      this.window.on('scroll-touch-end', () => {
        this.window.webContents.send(WB_WINDOW_DARWIN_SCROLL_TOUCH_END, {})
      })
    } else if (process.platform === 'win32') {
      this.window.on('app-command', (evt, cmd) => {
        switch (cmd) {
          case 'browser-backward': this.navigateBack(); break
          case 'browser-forward': this.navigateForward(); break
        }
      })
    }
  }

  /* ****************************************************************************/
  // Window handlers
  /* ****************************************************************************/

  /**
  * Handles the window coming into focus
  * @param evt: the event that fired
  */
  _handleWindowFocused = (evt) => {
    this[privLastTimeInFocus] = new Date().getTime()
    this.window.webContents.send(WB_WINDOW_FOCUS)
    evtMain.emit(evtMain.WB_WINDOW_FOCUSED, {}, this.window.id)
  }

  /**
  * Handles the window leaving focus
  * @param evt: the event that fired
  */
  _handleWindowBlurred = (evt) => {
    this[privLastTimeInFocus] = new Date().getTime()
    this.window.webContents.send(WB_WINDOW_BLUR)
    evtMain.emit(evtMain.WB_WINDOW_BLURRED, {}, this.window.id)
  }

  /* ****************************************************************************/
  // Webcontents handlers
  /* ****************************************************************************/

  /**
  * Handles the window preparing to navigate and prevents if requred
  * @param evt: the event that fired
  * @param nextUrl: the next url being navigated to
  */
  _handleWillNavigate = (evt, nextUrl) => {
    if (!this.allowNavigate(evt, this.window, nextUrl)) {
      evt.preventDefault()
    }
  }

  /* ****************************************************************************/
  // State lifecycle
  /* ****************************************************************************/

  /**
  * Updates the menubar
  */
  updateWindowMenubar = (settingsState) => {
    this[settingsState.ui.showAppMenu ? 'showAppMenu' : 'hideAppMenu']()
  }

  /* ****************************************************************************/
  // Actions: Lifecycle
  /* ****************************************************************************/

  /**
  * Closes the window respecting any behaviour modifiers that are set
  * @return this
  */
  close () {
    // If we're in a failed launch, we can try to close which just causes another error
    if (this.window) {
      this.window.close()
    }
    return this
  }

  /**
  * Blurs a window
  * @return this
  */
  blur () {
    this.window.blur()
    return this
  }

  /**
  * Focuses a window
  * @return this
  */
  focus () {
    this.window.focus()
    return this
  }

  /**
  * Reloads the webview
  * @return this
  */
  reload () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = webContents.fromId(wcId)
    if (!wc) { return }
    wc.reload()
    return this
  }

  /**
  * Reloads the wavebox window
  * @return this
  */
  reloadWaveboxWindow () {
    this.window.webContents.reload()
    return this
  }

  /**
  * Navigates the content window backwards
  * @return this
  */
  navigateBack () {
    this.window.webContents.goBack()
    return this
  }

  /**
  * Navigates the content window forwards
  * @return this
  */
  navigateForward () {
    this.window.webContents.goForward()
    return this
  }

  /* ****************************************************************************/
  // Actions: Visibility
  /* ****************************************************************************/

  /**
  * Shows the window
  * @param restoreState=true: true to restore the saved window state
  * @return this
  */
  show (restoreState = true) {
    if (restoreState) {
      this.locationSaver.showWithSavedScreenLocation()
    } else {
      this.window.show()
    }
    return this
  }

  /**
  * Hides the window
  * @return this
  */
  hide () {
    this.window.hide()
    return this
  }

  /**
  * Toggles fullscreen mode
  * @return this
  */
  toggleFullscreen () {
    if (this.window.isFullScreenable()) {
      this.window.setFullScreen(!this.window.isFullScreen())
    } else {
      this.window.maximize(!this.window.isMaximized())
    }
    return this
  }

  /**
  * Minimizes the window
  * @return this
  */
  minimize () {
    this.window.minimize()
    return this
  }

  /**
  * @return true if the window is minimized
  */
  isMinimized () {
    return this.window.isMinimized()
  }

  /* ****************************************************************************/
  // Actions: Dev
  /* ****************************************************************************/

  /**
  * Opens dev tools for this window
  * @return this
  */
  openDevTools () {
    this.window.webContents.openDevTools()
    return this
  }

  /**
  * Opens the wavebox dev tools for this window
  * @return this
  */
  openWaveboxDevTools () {
    this.window.webContents.openDevTools()
    return this
  }

  /* ****************************************************************************/
  // Actions: Display
  /* ****************************************************************************/

  /**
  * Show the app menu
  * @return this
  */
  showAppMenu () {
    this.window.setMenuBarVisibility(true)
    return this
  }

  /**
  * Hide the app menu
  * @return this
  */
  hideAppMenu () {
    this.window.setMenuBarVisibility(false)
    return this
  }

  /* ****************************************************************************/
  // Actions: Misc
  /* ****************************************************************************/

  /**
  * Sets the download progress
  * @param v: the download progress to set
  * @return this
  */
  setProgressBar (v) {
    this.window.setProgressBar(v)
    return this
  }

  /* ****************************************************************************/
  // Actions: Find
  /* ****************************************************************************/

  /**
  * Starts finding in the mailboxes window
  * @return this
  */
  findStart () {
    this.window.webContents.send(WB_WINDOW_FIND_START, { })
    return this
  }

  /**
  * Finds the next in the mailbox window
  * @return this
  */
  findNext () {
    this.window.webContents.send(WB_WINDOW_FIND_NEXT, { })
    return this
  }

  /* ****************************************************************************/
  // Actions: Zoom
  /* ****************************************************************************/

  /**
  * Zooms the current window in
  * @return this
  */
  zoomIn () {
    const webContentsId = this.focusedTabId()
    if (!webContentsId) { return this }
    const wc = webContents.fromId(webContentsId)
    if (!wc || wc.isDestroyed()) { return this }
    wc.getZoomFactor((factor) => { wc.setZoomFactor(factor + 0.1) })
    return this
  }

  /**
  * Zooms the current window out
  * @return this
  */
  zoomOut () {
    const webContentsId = this.focusedTabId()
    if (!webContentsId) { return this }
    const wc = webContents.fromId(webContentsId)
    if (!wc || wc.isDestroyed()) { return this }
    wc.getZoomFactor((factor) => { wc.setZoomFactor(factor - 0.1) })
    return this
  }

  /**
  * Resets the zoom on the current window
  * @return this
  */
  zoomReset () {
    const webContentsId = this.focusedTabId()
    if (!webContentsId) { return this }
    const wc = webContents.fromId(webContentsId)
    if (!wc || wc.isDestroyed()) { return this }
    wc.setZoomFactor(1.0)
    return this
  }

  /* ****************************************************************************/
  // Query
  /* ****************************************************************************/

  /**
  * @return true if the window is focused
  */
  isFocused () {
    return this.window.isFocused()
  }

  /**
  * @return the id of the focused tab
  */
  focusedTabId () {
    throw new Error('WaveboxWindow.focusedTabId not implemented')
  }

  /**
  * @return the ids of the tabs in this window
  */
  tabIds () {
    throw new Error('WaveboxWindow.tabIds not implemented')
  }

  /**
  * @param tabId: the id of the tab
  * @return the info about the tab
  */
  tabMetaInfo (tabId) {
    throw new Error('WaveboxWindow.tabMetaInfo not implemented')
  }

  /**
  * @return process info about the tabs with { webContentsId, description, pid }
  */
  webContentsProcessInfo () {
    const webContentsIds = new Set(this.tabIds())
    webContentsIds.add(this.window.webContents.id)

    return Array.from(webContentsIds).map((wcId) => {
      const wc = webContents.fromId(wcId)
      const pid = wc ? wc.getOSProcessId() : undefined
      const url = wc ? wc.getURL() : undefined
      return {
        webContentsId: wcId,
        pid: pid,
        url: url
      }
    })
  }

  /**
  * @return true if the window is fullscreen
  */
  isFullScreen () {
    return this.window.isFullScreen()
  }

  /**
  * @return true if the window is visible
  */
  isVisible () {
    return this.window.isVisible()
  }

  /**
  * @return true if this window is destroyed
  */
  isDestroyed () {
    return this.window.isDestroyed()
  }
}

export default WaveboxWindow
