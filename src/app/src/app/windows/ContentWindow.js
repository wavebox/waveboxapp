const WaveboxWindow = require('./WaveboxWindow')
const { shell } = require('electron')
const querystring = require('querystring')
const path = require('path')
const mouseFB = process.platform === 'linux' ? require('mouse-forward-back') : undefined
const {
  WB_WINDOW_RELOAD_WEBVIEW,
  WB_WINDOW_NAVIGATE_WEBVIEW_BACK,
  WB_WINDOW_NAVIGATE_WEBVIEW_FORWARD
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

    // Mouse navigation
    if (process.platform === 'win32') {
      this.window.on('app-command', (evt, cmd) => {
        switch (cmd) {
          case 'browser-backward': this.navigateBack(); break
          case 'browser-forward': this.navigateForward(); break
        }
      })
    } else if (process.platform === 'linux') {
      // Re-register the event on focus as newly focused windows will overwrite this
      this.registerLinuxMouseNavigation()
      this.window.on('focus', () => {
        this.registerLinuxMouseNavigation()
      })
    }

    return this
  }

  /* ****************************************************************************/
  // Registering
  /* ****************************************************************************/

  /**
  * Binds the listeners for mouse navigation on linux
  */
  registerLinuxMouseNavigation () {
    mouseFB.register((btn) => {
      switch (btn) {
        case 'back': this.navigateBack(); break
        case 'forward': this.navigateForward(); break
      }
    }, this.window.getNativeWindowHandle())
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
