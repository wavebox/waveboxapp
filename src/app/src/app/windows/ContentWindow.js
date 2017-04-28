const WaveboxWindow = require('./WaveboxWindow')
const { shell } = require('electron')
const querystring = require('querystring')
const path = require('path')

const CONTENT_DIR = path.resolve(path.join(__dirname, '/../../../scenes/content'))

class ContentWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Creation
  /* ****************************************************************************/

  /**
  * Generates the url for the window
  * @param url: the url to load
  * @param partition: the partition to load in
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
  * Starts the window
  * @param url: the start url
  * @param partition: the window partition
  * @param parentWindow: the parent window this spawned from
  */
  start (url, partition, parentWindow) {
    const copyPosition = !parentWindow.isFullScreen() && !parentWindow.isMaximized()
    const parentSize = copyPosition ? (() => {
      const position = parentWindow.getPosition()
      const size = parentWindow.getSize()
      return {
        x: position[0] + 20,
        y: position[1] + 20,
        width: size[0],
        height: size[1]
      }
    })() : undefined

    super.start(this.generateWindowUrl(url, partition), Object.assign({
      minWidth: 770,
      minHeight: 300,
      fullscreenable: true,
      title: 'Wavebox',
      backgroundColor: '#f2f2f2',
      webPreferences: {
        nodeIntegration: true
      }
    }, parentSize))
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
