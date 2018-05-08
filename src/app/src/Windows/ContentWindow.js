import WaveboxWindow from './WaveboxWindow'
import { app, webContents } from 'electron'
import { evtMain } from 'AppEvents'
import Resolver from 'Runtime/Resolver'
import {WindowOpeningHandler} from './WindowOpeningEngine'
import { GuestWebPreferences } from 'WebContentsManager'
import querystring from 'querystring'

const privTabMetaInfo = Symbol('tabMetaInfo')
const privGuestWebPreferences = Symbol('privGuestWebPreferences')
const privGuestWebContentsId = Symbol('privGuestWebContentsId')

class ContentWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Class: Properties
  /* ****************************************************************************/

  static get windowType () { return this.WINDOW_TYPES.CONTENT }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param tabMetaInfo=undefined: the tab meta info for the tab we will be hosting
  */
  constructor (tabMetaInfo = undefined) {
    super()
    this[privTabMetaInfo] = tabMetaInfo
    this[privGuestWebPreferences] = {}
    this[privGuestWebContentsId] = null
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get rootWebContentsHasContextMenu () { return false }
  get allowsGuestClosing () { return true }

  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Generates the url for the window
  * @param url: the url to load
  * @param partition: the partition for the webview
  * @return a fully qualified url to give to the window object
  */
  generateWindowUrl (url, partition) {
    const params = querystring.stringify({
      url: url,
      partition: partition
    })
    return `file://${Resolver.contentScene('content.html')}?${params}`
  }

  /**
  * Generates the window positioning based on the parent window
  * @param parentWindow: the parent browser window
  * @return positioning info or undefined
  */
  generateWindowPosition (parentWindow) {
    if (!parentWindow) { return undefined }
    if (parentWindow.isFullScreen() || parentWindow.isMaximized()) { return { center: true } }

    const [x, y] = parentWindow.getPosition()
    const [width, height] = parentWindow.getSize()

    return {
      x: x + 20,
      y: y + 20,
      width: width,
      height: height
    }
  }

  /**
  * Starts the window
  * @param url: the start url
  * @param browserWindowOptions={}: the configuration for the window
  * @param parentWindow=null: the parent window this spawned from
  * @param guestWebPreferences={}: the web preferences for the hosted child
  */
  create (url, browserWindowOptions = {}, parentWindow = null, guestWebPreferences = {}) {
    // Save the launch info for later
    this[privGuestWebPreferences] = guestWebPreferences

    // Launch the new window
    super.create(this.generateWindowUrl(url, guestWebPreferences.partition), {
      minWidth: 300,
      minHeight: 300,
      fullscreenable: true,
      title: 'Wavebox',
      backgroundColor: '#FFFFFF',
      show: true,
      webPreferences: {
        nodeIntegration: true,
        plugins: true
      },
      ...this.generateWindowPosition(parentWindow),
      ...([
        'width',
        'height',
        'x',
        'y',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
        'resizable',
        'title'
      ].reduce((acc, k) => {
        if (browserWindowOptions[k] !== undefined) {
          acc[k] = browserWindowOptions[k]
        }
        return acc
      }, {}))
    })

    // remove built in listener so we can handle this on our own
    this.window.webContents.removeAllListeners('devtools-reload-page')
    this.window.webContents.on('devtools-reload-page', () => this.window.reload())

    // Listen on webcontents events
    this.window.webContents.on('will-attach-webview', this.handleWillAttachWebview)
    app.on('web-contents-created', this.handleAppWebContentsCreated)

    return this
  }

  /**
  * Handles destroy being called
  */
  destroy (evt) {
    app.removeListener('web-contents-created', this.handleAppWebContentsCreated)
    super.destroy(evt)
  }

  /* ****************************************************************************/
  // Webview events
  /* ****************************************************************************/

  /**
  * Handles a webview preparing to attach
  * @param evt: the event that fired
  * @param webViewWebPreferences: the webPreferences of the new webview
  * @param webViewProperties: the properites of the new webview
  */
  handleWillAttachWebview = (evt, webViewWebPreferences, webViewProperties) => {
    // Web Preferences
    GuestWebPreferences.copyForChild(this[privGuestWebPreferences], webViewWebPreferences)
    GuestWebPreferences.defaultGuestPreferences(webViewWebPreferences)
    GuestWebPreferences.sanitizeForGuestUse(webViewWebPreferences)

    // Web view properties
    webViewProperties.partition = this[privGuestWebPreferences].partition
  }

  /**
  * Handles a webview attaching
  * @param evt: the event that fired
  * @param contents: the webcontents that did attach
  */
  handleAppWebContentsCreated = (evt, contents) => {
    setImmediate(() => {
      if (contents.isDestroyed()) { return }
      if (contents.getType() === 'webview' && contents.hostWebContents.id === this.window.webContents.id) {
        this[privGuestWebContentsId] = contents.id
        evtMain.emit(evtMain.WB_TAB_CREATED, {}, this[privGuestWebContentsId])
        contents.on('new-window', this.handleWebContentsNewWindow)
        contents.on('will-navigate', this.handleWebViewWillNavigate)
        contents.once('destroyed', () => {
          const wcId = this[privGuestWebContentsId]
          this[privGuestWebContentsId] = null
          evtMain.emit(evtMain.WB_TAB_DESTROYED, {}, wcId)
        })
      }
    })
  }

  /* ****************************************************************************/
  // Webcontents events
  /* ****************************************************************************/

  /**
  * Handles the webcontents requesting a new window
  * @param evt: the event that fired
  * @param targetUrl: the webview url
  * @param frameName: the name of the frame
  * @param disposition: the frame disposition
  * @param options: the browser window options
  * @param additionalFeatures: The non-standard features
  */
  handleWebContentsNewWindow = (evt, targetUrl, frameName, disposition, options, additionalFeatures) => {
    WindowOpeningHandler.handleOpenNewWindow(evt, {
      targetUrl: targetUrl,
      frameName: frameName,
      disposition: disposition,
      options: options,
      additionalFeatures: additionalFeatures,
      openingBrowserWindow: this.window,
      openingWindowType: this.windowType,
      tabMetaInfo: this[privTabMetaInfo],
      provisionalTargetUrl: undefined
    })
  }

  /**
  * Handles the webview navigating
  * @param evt: the event that fired
  * @param targetUrl: the url we're navigating to
  */
  handleWebViewWillNavigate = (evt, targetUrl) => {
    WindowOpeningHandler.handleWillNavigate(evt, {
      targetUrl: targetUrl,
      openingBrowserWindow: this.window,
      openingWindowType: this.windowType,
      tabMetaInfo: this[privTabMetaInfo]
    })
  }

  /* ****************************************************************************/
  // Actions
  /* ****************************************************************************/

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
  * Navigates the content window backwards
  * @return this
  */
  navigateBack () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = webContents.fromId(wcId)
    if (!wc) { return }
    wc.goBack()
    return this
  }

  /**
  * Navigates the content window forwards
  * @return this
  */
  navigateForward () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = webContents.fromId(wcId)
    if (!wc) { return }
    wc.goForward()
    return this
  }

  /* ****************************************************************************/
  // Actions: Dev
  /* ****************************************************************************/

  /**
  * Opens the dev tools for the webview
  * @return this
  */
  openDevTools () {
    const wcId = this.focusedTabId()
    if (!wcId) { return }
    const wc = webContents.fromId(wcId)
    if (!wc) { return }
    wc.openDevTools()
    return this
  }

  /* ****************************************************************************/
  // Query
  /* ****************************************************************************/

  /**
  * @return the id of the focused webcontents
  */
  focusedTabId () {
    return this[privGuestWebContentsId]
  }

  /**
  * @return the ids of the tabs in this window
  */
  tabIds () {
    return this[privGuestWebContentsId] === null ? [] : [this[privGuestWebContentsId]]
  }

  /**
  * @param tabId: the id of the tab
  * @return the info about the tab
  */
  tabMetaInfo (tabId) {
    return tabId === this[privGuestWebContentsId] ? this[privTabMetaInfo] : undefined
  }

  /**
  * @return process info about the tabs with { webContentsId, description, pid, url }
  */
  webContentsProcessInfo () {
    return this.tabIds().map((tabId) => {
      const wc = webContents.fromId(tabId)
      return {
        webContentsId: tabId,
        pid: wc ? wc.getOSProcessId() : undefined,
        url: wc ? wc.getURL() : undefined
      }
    }).concat([{
      webContentsId: this.window.webContents.id,
      pid: this.window.webContents.getOSProcessId(),
      description: 'Content Window'
    }])
  }
}

export default ContentWindow
