import WaveboxWindow from './WaveboxWindow'
import { shell, ipcMain, app, webContents } from 'electron'
import { evtMain } from 'AppEvents'
import querystring from 'querystring'
import {
  WB_WINDOW_RELOAD_WEBVIEW,
  WB_WINDOW_OPEN_DEV_TOOLS_WEBVIEW,
  WB_WINDOW_NAVIGATE_WEBVIEW_BACK,
  WB_WINDOW_NAVIGATE_WEBVIEW_FORWARD,
  WB_NEW_WINDOW
} from 'shared/ipcEvents'
import Resolver from 'Runtime/Resolver'
import ContentPopupWindow from './ContentPopupWindow'
import url from 'url'

const SAFE_CONFIG_KEYS = [
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
]
const COPY_WEBVIEW_WEB_PREFERENCES_KEYS = [
  'guestInstanceId',
  'openerId',
  'partition'
]

const privLaunchInfo = Symbol('privLaunchInfo')
const privGuestWebContentsId = Symbol('privGuestWebContentsId')

class ContentWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param ownerId: the id of the owner - mailbox/service
  */
  constructor (ownerId) {
    super()
    this.ownerId = ownerId
    this[privLaunchInfo] = null
    this[privGuestWebContentsId] = null
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get launchInfo () { return this[privLaunchInfo] }

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
    if (parentWindow.isFullScreen() || parentWindow.isMaximized()) { return undefined }

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
  * Generates a safe sanitized list of browser window preferences, as these may have
  * come from a host page so they can't be trusted. e.g. don't copy anything like webPreferences
  * @param unsafe: the unsafe browser window preferences
  * @return a copy of the preferences from a predefined list of safe keys
  */
  safeBrowserWindowPreferences (unsafe) {
    return SAFE_CONFIG_KEYS.reduce((acc, k) => {
      if (unsafe[k] !== undefined) {
        acc[k] = unsafe[k]
      }
      return acc
    }, {})
  }

  /**
  * Starts the window
  * @param parentWindow: the parent window this spawned from
  * @param url: the start url
  * @param partition: the partition to supply to the webview
  * @param browserWindowPreferences={}: the configuration for the window
  * @param webPreferences={}: the web preferences for the hosted child
  */
  create (parentWindow, url, partition, browserWindowPreferences = {}, webPreferences = {}) {
    this[privLaunchInfo] = Object.freeze({
      partition: partition,
      browserWindowPreferences: browserWindowPreferences,
      webPreferences: webPreferences
    })
    super.create(this.generateWindowUrl(url, partition), Object.assign(
      {
        minWidth: 300,
        minHeight: 300,
        fullscreenable: true,
        title: 'Wavebox',
        backgroundColor: '#FFFFFF',
        show: true,
        webPreferences: {
          nodeIntegration: true,
          plugins: true
        }
      },
      this.generateWindowPosition(parentWindow),
      this.safeBrowserWindowPreferences(browserWindowPreferences)
    ))

    // New window handling
    ipcMain.on(WB_NEW_WINDOW, this.handleIPCOpenNewWindow)

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
    ipcMain.removeListener(WB_NEW_WINDOW, this.handleIPCOpenNewWindow)
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
    const launchInfo = this.launchInfo
    COPY_WEBVIEW_WEB_PREFERENCES_KEYS.forEach((k) => {
      webViewWebPreferences.partition = launchInfo.partition
      if (launchInfo.webPreferences[k] !== undefined) {
        webViewWebPreferences[k] = launchInfo.webPreferences[k]
      }
    })
    webViewProperties.partition = launchInfo.partition
  }

  /**
  * Handles a webview attaching
  * @param evt: the event that fired
  * @param contents: the webcontents that did attach
  */
  handleAppWebContentsCreated = (evt, contents) => {
    if (contents.getType() === 'webview' && contents.hostWebContents.id === this.window.webContents.id) {
      this[privGuestWebContentsId] = contents.id
      evtMain.emit(evtMain.WB_TAB_CREATED, this[privGuestWebContentsId])
      contents.on('new-window', this.handleWebContentsNewWindow)
      contents.once('destroyed', () => {
        const wcId = this[privGuestWebContentsId]
        this[privGuestWebContentsId] = null
        evtMain.emit(evtMain.WB_TAB_DESTROYED, wcId)
      })
    }
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
    // (@Thomas101) This is really just a slimmed down implementation of what MailboxesWindowBehaviour
    // does. It was added with grammarly & extension tabbing in mind and should work well for most use
    // cases but may need some review in the future

    evt.preventDefault()
    const parsedTargetUrl = url.parse(targetUrl, true)

    // Content Popup Window
    const openPopup = (
      disposition === 'new-window' ||
      targetUrl === 'about:blank' ||
      // We have some specific overrides for oauth2 and google
      (parsedTargetUrl.hostname === 'accounts.google.com' && parsedTargetUrl.pathname.startsWith('/o/oauth2/auth'))
    )
    if (openPopup) {
      const contentWindow = new ContentPopupWindow(this.ownerId)
      contentWindow.create(targetUrl, options)
      evt.newGuest = contentWindow.window
      return
    }

    // Save
    if (disposition === 'save-to-disk') {
      if ((options || {}).webContents) {
        options.webContents.downloadURL(targetUrl)
        return
      }
    }

    // Catch-all: browser
    shell.openExternal(targetUrl)
  }

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  /**
  * Opens a new content window
  * @param evt: the event that fired
  * @param body: the arguments from the body
  */
  handleIPCOpenNewWindow = (evt, body) => {
    if (evt.sender === this.window.webContents) {
      const contentWindow = new ContentWindow(this.ownerId)
      contentWindow.create(this.window, body.url, this.launchInfo.partition, this.launchInfo.windowPreferences, this.launchInfo.webPreferences)
    }
  }

  /* ****************************************************************************/
  // Actions
  /* ****************************************************************************/

  /**
  * Reloads the webview content
  * @return this
  */
  reload () {
    this.window.webContents.send(WB_WINDOW_RELOAD_WEBVIEW, {})
    return this
  }

  /**
  * Navigates the content window backwards
  * @return this
  */
  navigateBack () {
    this.window.webContents.send(WB_WINDOW_NAVIGATE_WEBVIEW_BACK, {})
    return this
  }

  /**
  * Navigates the content window forwards
  * @return this
  */
  navigateForward () {
    this.window.webContents.send(WB_WINDOW_NAVIGATE_WEBVIEW_FORWARD, {})
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
    this.window.webContents.send(WB_WINDOW_OPEN_DEV_TOOLS_WEBVIEW, {})
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
