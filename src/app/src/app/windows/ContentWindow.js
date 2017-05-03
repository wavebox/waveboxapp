const WaveboxWindow = require('./WaveboxWindow')
const { shell } = require('electron')
const querystring = require('querystring')
const path = require('path')

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
const COPY_WEB_PREFERENCES_KEYS = [
  'guestInstanceId',
  'openerId',
  'partition'
]

class ContentWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Creation
  /* ****************************************************************************/

  /**
  * Generates the url for the window
  * @param url: the url to load
  * @return a fully qualified url to give to the window object
  */
  generateWindowUrl (url) {
    const params = querystring.stringify({
      url: url
    })
    return `file://${path.join(CONTENT_DIR, 'content.html')}?${params}`
  }

  /**
  * Starts the window
  * @param parentWindow: the parent window this spawned from
  * @param url: the start url
  * @param windowPreferences={}: the configuration for the window
  * @param webPreferences={}: the web preferences for the hosted child
  */
  start (parentWindow, url, windowPreferences = {}, webPreferences = {}) {
    // Store some local vars
    this.guestWebPreferences = Object.assign({}, webPreferences)

    // Grab the position from the parent window
    const copyPosition = !parentWindow.isFullScreen() && !parentWindow.isMaximized()
    const parentSizing = copyPosition ? (() => {
      const position = parentWindow.getPosition()
      const size = parentWindow.getSize()
      return {
        x: position[0] + 20,
        y: position[1] + 20,
        width: size[0],
        height: size[1]
      }
    })() : undefined

    // Generate the full windowPreferences
    const fullWindowPreferences = Object.assign(
      {
        minWidth: 300,
        minHeight: 300,
        fullscreenable: true,
        title: 'Wavebox',
        backgroundColor: '#f2f2f2',
        webPreferences: {
          nodeIntegration: true
        }
      },
      parentSizing,
      SAFE_CONFIG_KEYS.reduce((acc, k) => { // These keys can come from a hosted page, so don't copy anything like webPreferences
        if (windowPreferences[k] !== undefined) {
          acc[k] = windowPreferences[k]
        }
        return acc
      }, {})
    )

    // Start the browser window
    super.start(this.generateWindowUrl(url), fullWindowPreferences)
  }

  /**
  * Creates and launches the window
  * @arguments: passed through to super()
  */
  createWindow () {
    super.createWindow.apply(this, Array.from(arguments))
    this.window.webContents.on('new-window', (evt, url) => {
      evt.preventDefault()
      shell.openExternal(url)
    })

    this.window.webContents.on('will-attach-webview', (evt, webPreferences, properties) => {
      COPY_WEB_PREFERENCES_KEYS.forEach((k) => {
        webPreferences[k] = this.guestWebPreferences[k]
      })
    })
  }

  /* ****************************************************************************/
  // Actions
  /* ****************************************************************************/

  /**
  * Reloads the webview content
  * @return this
  */
  reload () {
    this.window.webContents.send('reload-webview', {})
    return this
  }
}

module.exports = ContentWindow
