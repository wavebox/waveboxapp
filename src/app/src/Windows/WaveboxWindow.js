import electron from 'electron'
import EventEmitter from 'events'
import { evtMain } from 'AppEvents'
import { settingsStore } from 'stores/settings'
import WaveboxWindowLocationSaver from './WaveboxWindowLocationSaver'
import WaveboxWindowManager from './WaveboxWindowManager'
import {
  WB_WINDOW_FIND_START,
  WB_WINDOW_FIND_NEXT,
  WB_WINDOW_FOCUS,
  WB_WINDOW_BLUR,
  WB_WINDOW_MIN_MAX_DBL_CLICK,
  WB_WINDOW_RESET_VISUAL_ZOOM
} from 'shared/ipcEvents'
import Resolver from 'Runtime/Resolver'
import WINDOW_TYPES from './WindowTypes'
import ElectronWebContentsWillNavigateShim from 'ElectronTools/ElectronWebContentsWillNavigateShim'

const { BrowserWindow, webContents, ipcMain } = electron
const privWindow = Symbol('privWindow')
const privBrowserWindowId = Symbol('privBrowserWindowId')
const privLocationSaver = Symbol('privLocationSaver')
const privLastTimeInFocus = Symbol('privLastTimeInFocus')
const privMinMaxLast = Symbol('privMinMaxLast')
const privTouchBarProvider = Symbol('privTouchBarProvider')

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
  static allTabIdsWithBacking (backingType) { return waveboxWindowManager.allTabIdsWithBacking(backingType) }
  static allTabMetaWithBacking (backingType) { return waveboxWindowManager.allTabMetaWithBacking(backingType) }
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
    this[privMinMaxLast] = null

    // Events
    ipcMain.on(WB_WINDOW_MIN_MAX_DBL_CLICK, this._handleMinMaxDoubleClickWindow)
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
    const settingsState = settingsStore.getState()
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
    this[settingsState.ui.showAppMenu ? 'showAppMenu' : 'hideAppMenu']()

    // Bind window event listeners
    this.window.on('close', (evt) => this.emit('close', evt))
    this.window.on('closed', (evt) => this.destroy(evt))
    this.window.on('focus', this._handleWindowFocused)
    this.window.on('blur', this._handleWindowBlurred)
    this.bindMouseNavigation()

    if (settingsState.launched.app.forceWindowPaintOnRestore) {
      this.window.on('restore', this._forceRestoreRepaint)
      this.window.on('show', this._forceRestoreRepaint)
    }

    // Restore window position
    if (fullBrowserWindowPreferences.show) {
      this._restoreWindowPosition(savedLocation)
    } else {
      this.window.once('ready-to-show', (evt) => {
        // Defer this as we may be showing the window hidden and choosing
        // to show on this callback. Do this to to ensure we are the last
        // callback and we have the most up to date state.
        //
        // If show is set to false, then don't pass maximized or fullscreen
        // as this will change the visiblity state
        setImmediate(() => {
          this._restoreWindowPosition(
            this[privWindow].isVisible()
              ? savedLocation
              : { ...savedLocation, maximized: false, fullscreen: false }
          )
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
    ElectronWebContentsWillNavigateShim.on(this.window.webContents, this._handleWillNavigate)

    // Global registers
    waveboxWindowManager.attach(this)
    setTimeout(() => { // Requeue to happen on setup complete
      evtMain.emit(evtMain.WB_WINDOW_CREATED, {}, this.browserWindowId)
    })

    // Touchbar
    if (process.platform === 'darwin' && settingsState.launched.app.touchBarSupportEnabled) {
      this[privTouchBarProvider] = this.createTouchbarProvider()
    }

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
        const workArea = (electron.screen.getDisplayMatching(windowBounds) || electron.screen.getPrimaryDisplay()).workArea
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
    ipcMain.removeListener(WB_WINDOW_MIN_MAX_DBL_CLICK, this._handleMinMaxDoubleClickWindow)
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

    // Touchbar
    if (this[privTouchBarProvider]) {
      if (this[privTouchBarProvider].destroy) {
        this[privTouchBarProvider].destroy()
      }
      this[privTouchBarProvider] = undefined
    }

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

  /**
  * Hook that gets called before the app fully quits from a keyboard shortcut
  * Overwrite this for custom behaviours
  * @param accelerator: the accelerator that was called
  * @return false to allow full quit, true to prevent the behaviour
  */
  onBeforeFullQuit (accelerator) {
    return false
  }

  /**
  * Hook that gets called to determine where to send window open requests to
  * @return a webContents if supported, falsey if not
  */
  userLinkOpenRequestResponder () {
    return null
  }

  /**
  * Hook that gets called to init the touchbar provider
  * @return an object that can be used to run the touchbar or undefined
  */
  createTouchbarProvider () { return undefined }

  /* ****************************************************************************/
  // Mouse Navigation
  /* ****************************************************************************/

  /**
  * Shows the basic addressbar in the window
  */
  showNativeUI () {
    // Setup the addressbar
    if (electron.TextField) {
      const { View, BoxLayout, TextField } = electron
      const contentView = new View()
      const contentLayout = new BoxLayout('vertical')
      const addressBar = new TextField()
      const mainView = this.window.getContentView()
      addressBar.setReadOnly(true)
      contentView.setLayoutManager(contentLayout)
      contentView.addChildView(addressBar)
      contentView.addChildView(mainView)
      contentLayout.setFlexForView(mainView, 1)
      this.window.setContentView(contentView)

      addressBar.setText(this.window.webContents.getURL())
      addressBar.selectStartRange()
      this.window.webContents.on('did-navigate', (evt, url) => {
        addressBar.setText(url)
        addressBar.selectStartRange()
      })
      this.window.webContents.on('did-navigate-in-page', (evt, url, isMainFrame) => {
        if (isMainFrame) {
          addressBar.setText(url)
          addressBar.selectStartRange()
        }
      })
      this.window.setMenuBarVisibility(false)
    }
  }

  /* ****************************************************************************/
  // Mouse Navigation
  /* ****************************************************************************/

  /**
  * Binds the mouse navigation shortcuts
  * Darwin is handled in the rendering thread
  */
  bindMouseNavigation () {
    if (process.platform === 'win32') {
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

  /**
  * Handles the minimize/maximize behaviour of the window
  */
  _handleMinMaxDoubleClickWindow = (evt) => {
    if (evt.sender.id !== this.rootWebContentsId) { return }

    if (this.window.isMaximized() || this.window.isFullScreen()) {
      if (this.window.isFullScreen()) {
        this.window.setFullScreen(false)
      }

      if (process.platform === 'darwin') {
        if (this[privMinMaxLast]) {
          this.window.setBounds(this[privMinMaxLast], true)
        } else {
          this.window.setSize(800, 600, true)
        }
      } else {
        this.window.unmaximize()
      }
    } else {
      this[privMinMaxLast] = this.window.getBounds()
      this.window.maximize()
    }
  }

  /**
  * Forces a repaint on restore
  */
  _forceRestoreRepaint = () => {
    clearTimeout(this.__forceRestoreThrottle || null)
    this.__forceRestoreThrottle = setTimeout(() => {
      if (!this.window || this.window.isDestroyed()) { return }

      const [w, h] = this.window.getSize()
      this.window.setSize(w, h - 0, false)
      setTimeout(() => {
        if (!this.window || this.window.isDestroyed()) { return }
        this.window.setSize(w, h, false)
        setTimeout(() => {
          if (!this.window || this.window.isDestroyed()) { return }
          this.window.webContents.invalidate()
        }, 1)
      }, 1)
    }, 100)
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
  * Stops the current webview
  * @return this
  */
  stop () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = webContents.fromId(wcId)
    if (!wc) { return }
    wc.stop()
    return this
  }

  /**
  * Stops the webcontents if loading, otherwise reloads
  */
  reloadOrStop () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = webContents.fromId(wcId)
    if (!wc) { return }
    if (wc.isLoading()) {
      wc.stop()
    } else {
      wc.reload()
    }
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
  * Shows the window
  * @return this
  */
  show () {
    if (!this.window.isVisible()) {
      this.locationSaver.showWithSavedScreenLocation()
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
    wc.getZoomFactor((factor) => {
      wc.setZoomFactor(factor + 0.1)
    })
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
    wc.getZoomFactor((factor) => {
      wc.setZoomFactor(factor - 0.1)
    })
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
    wc.send(WB_WINDOW_RESET_VISUAL_ZOOM)
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
  * @return the webcontents which is an editable target
  */
  focusedEditableWebContents () {
    throw new Error('WaveboxWindow.focusedEditableWebContents not implemented')
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

  /**
  * @return the bounds of the window
  */
  getBounds () {
    return this.window.getBounds()
  }

  /**
  * @return the content bounds of the window
  */
  getContentBounds () {
    return this.window.getContentBounds()
  }
}

export default WaveboxWindow
