import { BrowserWindow, webContents } from 'electron'
import EventEmitter from 'events'
import { evtMain } from 'AppEvents'
import settingStore from 'stores/settingStore'
import WaveboxWindowLocationSaver from './WaveboxWindowLocationSaver'
import {
  WB_WINDOW_FIND_START,
  WB_WINDOW_FIND_NEXT,
  WB_WINDOW_ZOOM_IN,
  WB_WINDOW_ZOOM_OUT,
  WB_WINDOW_ZOOM_RESET,
  WB_PING_RESOURCE_USAGE,
  WB_WINDOW_DARWIN_SCROLL_TOUCH_BEGIN,
  WB_WINDOW_DARWIN_SCROLL_TOUCH_END,
  WB_WINDOW_FOCUS,
  WB_WINDOW_BLUR
} from 'shared/ipcEvents'
import Resolver from 'Runtime/Resolver'

const privOwnerId = Symbol('privOwnerId')
const privWindow = Symbol('privWindow')
const privBrowserWindowId = Symbol('privBrowserWindowId')
const privLocationSaver = Symbol('privLocationSaver')
const privLastTimeInFocus = Symbol('privLastTimeInFocus')

const attached = new Map()

class WaveboxWindow extends EventEmitter {
  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  /**
  * @return all the attached wavebox windows
  */
  static all () { return Array.from(attached.values()) }

  /**
  * @return the window that was in focus last or is in focus now
  */
  static lastFocused () {
    const all = this.all()
    let last
    for (let i = 0; i < all.length; i++) {
      if (all[i].isFocused()) { return all[i] }
      if (!last || all[i].lastTimeInFocus > last.lastTimeInFocus) {
        last = all[i]
      }
    }
    return last
  }

  /**
  * @return the id of the window that was in focus last
  */
  static lastFocusedId () {
    const last = this.lastFocused()
    return last ? last.browserWindowId : undefined
  }

  /**
  * @return a list of tab ids
  */
  static allTabIds () {
    return this.all().reduce((acc, waveboxWindow) => {
      return acc.concat(waveboxWindow.tabIds())
    }, [])
  }

  /**
  * @param tabId: the id of the tab
  * @return the wavebox window that relates to the tab or undefined
  */
  static fromTabId (tabId) {
    const wc = webContents.fromId(tabId)
    if (!wc) { return undefined }
    const bw = BrowserWindow.fromWebContents(wc.hostWebContents || wc)
    if (!bw) { return undefined }
    return attached.get(bw.id)
  }

  /**
  * @return all the attached browser window ids
  */
  static allBrowserWindowIds () { return Array.from(attached.keys()) }

  /**
  * @param bwId: the id of the browser window
  * @return the window reference or undefined
  */
  static fromBrowserWindowId (bwId) { return attached.get(bwId) }

  /**
  * @return the id of the tab that's in focus in the focused window
  */
  static focusedTabId () {
    const focusedWindow = this.lastFocused()
    if (!focusedWindow) { return undefined }
    return focusedWindow.focusedTabId()
  }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param saverTag = undefined: the tag to use when saving the window position
  */
  constructor (saverTag = undefined) {
    super()

    this[privOwnerId] = null
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

  get ownerId () { return this[privOwnerId] }
  set ownerId (v) { this[privOwnerId] = v }

  get window () { return this[privWindow] }
  get browserWindowId () { return this[privBrowserWindowId] }
  get locationSaver () { return this[privLocationSaver] }
  get lastTimeInFocus () { return this[privLastTimeInFocus] }

  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Starts the app
  * @param url: the start url
  * @param browserWindowPreferences = {}: preferences to pass to the browser window
  * @return this
  */
  create (url, browserWindowPreferences = {}) {
    const savedLocation = this.locationSaver.getSavedScreenLocation()
    const fullBrowserWindowPreferences = Object.assign({},
      this.defaultBrowserWindowPreferences(),
      browserWindowPreferences,
      savedLocation
    )

    // On darwin if we set the y coord too high we can end up not showing the titlebar
    if (process.platform === 'darwin' && fullBrowserWindowPreferences.y !== undefined) {
      fullBrowserWindowPreferences.y = Math.max(fullBrowserWindowPreferences.y, 25)
    }

    // Create the window & prep for lifecycle
    this[privWindow] = new BrowserWindow(fullBrowserWindowPreferences)
    this[privBrowserWindowId] = this.window.id
    attached.set(this.browserWindowId, this)
    setTimeout(() => { // Requeue to happen on setup complete
      evtMain.emit(evtMain.WB_WINDOW_CREATED, this.browserWindowId)
    })

    // Restore the window position
    if (savedLocation.maximized && browserWindowPreferences.show !== false) {
      this.window.maximize()
    }
    this[settingStore.ui.showAppMenu ? 'showAppMenu' : 'hideAppMenu']()

    // Bind window event listeners
    this.window.on('close', (evt) => { this.emit('close', evt) })
    this.window.on('closed', (evt) => this.destroy(evt))
    this.window.on('focus', this._handleWindowFocused)
    this.window.on('blur', this._handleWindowBlurred)
    this.bindMouseNavigation()

    // Register state savers
    this.locationSaver.register(this.window)

    // Bind other change listeners
    settingStore.on('changed', this.updateWindowMenubar)

    // Load the start url
    this.window.loadURL(url)

    return this
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroy (evt) {
    settingStore.removeListener('changed', this.updateWindowMenubar)
    if (this.window) {
      this.locationSaver.unregister(this.window)
      if (!this.window.isDestroyed()) {
        this.window.close()
        this.window.destroy()
      }
      this[privWindow] = null
    }
    attached.delete(this.browserWindowId)
    setTimeout(() => {
      evtMain.emit(evtMain.WB_WINDOW_DESTROYED, this.browserWindowId)
    })
    this.emit('closed', evt)
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
    evtMain.emit(evtMain.WB_WINDOW_FOCUSED, this.window.id)
  }

  /**
  * Handles the window leaving focus
  * @param evt: the event that fired
  */
  _handleWindowBlurred = (evt) => {
    this[privLastTimeInFocus] = new Date().getTime()
    this.window.webContents.send(WB_WINDOW_BLUR)
    evtMain.emit(evtMain.WB_WINDOW_BLURRED, this.window.id)
  }

  /* ****************************************************************************/
  // State lifecycle
  /* ****************************************************************************/

  /**
  * Updates the menubar
  */
  updateWindowMenubar = (prev, next) => {
    this[settingStore.ui.showAppMenu ? 'showAppMenu' : 'hideAppMenu']()
  }

  /* ****************************************************************************/
  // Actions: Lifecycle
  /* ****************************************************************************/

  /**
  * Closes the window respecting any behaviour modifiers that are set
  * @return this
  */
  close () {
    this.window.close()
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
    this.window.webContents.reload()
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
    const windowRestore = restoreState ? this.locationSaver.getSavedScreenLocation() : undefined
    this.window.show()
    if (restoreState) {
      this.locationSaver.reapplySavedScreenLocation(windowRestore)
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

  /**
  * Requests that the window returns resource usage
  * @return this
  */
  pingResourceUsage () {
    this.window.webContents.send(WB_PING_RESOURCE_USAGE, { })
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
    this.window.webContents.send(WB_WINDOW_ZOOM_IN, { })
    return this
  }

  /**
  * Zooms the current window out
  * @return this
  */
  zoomOut () {
    this.window.webContents.send(WB_WINDOW_ZOOM_OUT, { })
    return this
  }

  /**
  * Resets the zoom on the current window
  * @return this
  */
  zoomReset () {
    this.window.webContents.send(WB_WINDOW_ZOOM_RESET, { })
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
