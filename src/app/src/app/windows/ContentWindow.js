const WaveboxWindow = require('./WaveboxWindow')
const { shell, ipcMain } = require('electron')
const querystring = require('querystring')
const appWindowManager = require('../appWindowManager')
const path = require('path')
const {
  WB_WINDOW_RELOAD_WEBVIEW,
  WB_WINDOW_NAVIGATE_WEBVIEW_BACK,
  WB_WINDOW_NAVIGATE_WEBVIEW_FORWARD,
  WB_NEW_WINDOW
} = require('../../shared/ipcEvents')

const CONTENT_DIR = path.resolve(path.join(__dirname, '/../../../scenes/content'))
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

class ContentWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()
    this.ownerId = null
    this.__launchInfo__ = null
    this.boundHandleOpenNewWindow = this.handleOpenNewWindow.bind(this)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get launchInfo () { return this.__launchInfo__ }

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
    return `file://${path.join(CONTENT_DIR, 'content.html')}?${params}`
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
    this.__launchInfo__ = Object.freeze({
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
        webPreferences: {
          nodeIntegration: true,
          plugins: true
        }
      },
      this.generateWindowPosition(parentWindow),
      this.safeBrowserWindowPreferences(browserWindowPreferences)
    ))

    // New window handling
    ipcMain.on(WB_NEW_WINDOW, this.boundHandleOpenNewWindow)
    this.window.webContents.on('new-window', (evt, url) => {
      evt.preventDefault()
      shell.openExternal(url)
    })

    // Patch through options into webview
    this.window.webContents.on('will-attach-webview', (evt, webViewWebPreferences, webViewProperties) => {
      COPY_WEBVIEW_WEB_PREFERENCES_KEYS.forEach((k) => {
        webViewWebPreferences.partition = partition
        if (webPreferences[k] !== undefined) {
          webViewWebPreferences[k] = webPreferences[k]
        }
      })
      webViewProperties.partition = partition
    })

    return this
  }

  /**
  * Handles destroy being called
  */
  destroy (evt) {
    ipcMain.removeListener(WB_NEW_WINDOW, this.boundHandleOpenNewWindow)
    super.destroy(evt)
  }

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  /**
  * Opens a new content window
  * @param evt: the event that fired
  * @param body: the arguments from the body
  */
  handleOpenNewWindow (evt, body) {
    if (evt.sender === this.window.webContents) {
      const contentWindow = new ContentWindow()
      contentWindow.ownerId = this.ownerId
      appWindowManager.addContentWindow(contentWindow)
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
}

module.exports = ContentWindow
