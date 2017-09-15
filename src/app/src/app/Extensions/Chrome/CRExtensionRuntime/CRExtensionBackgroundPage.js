const { webContents } = require('electron')
const fs = require('fs-extra')
const path = require('path')
const url = require('url')
const {
  CR_EXTENSION_PROTOCOL,
  CR_EXTENSION_BG_PARTITION_PREFIX
} = require('../../../../shared/extensionApis')

const PRELOAD_PATH = path.join(__dirname, '../../../../../guest/guest/crextensionBackgroundPage')

class CRExtensionBackgroundPage {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this._html = undefined
    this._name = undefined
    this._webContents = undefined

    this._start()
  }

  destroy () {
    this._stop()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isRunning () { return this._webContents && !this._webContents.isDestroyed() }
  get webContents () { return this._webContents }
  get html () { return this._html }
  get name () { return this._name }

  /* ****************************************************************************/
  // Script lifecycle
  /* ****************************************************************************/

  /**
  * Starts the background scripts
  */
  _start () {
    if (!this.extension.manifest.hasBackground) { return }

    if (this.extension.manifest.background.hasHtmlPage) {
      this._name = this.extension.manifest.background.htmlPage
      this._html = fs.readFileSync(path.join(this.extension.srcPath, this.extension.manifest.background.htmlPage))
    } else {
      this._name = '_generated_background_page.html'
      this._html = Buffer.from(this.extension.manifest.generateHtmlPageForScriptset())
    }

    this._webContents = webContents.create({
      partition: `${CR_EXTENSION_BG_PARTITION_PREFIX}${this.extension.id}`,
      isBackgroundPage: true,
      preload: PRELOAD_PATH,
      commandLineSwitches: [
        '--background-page',
        '--nodeIntegration=false'
      ]
    })
    this._webContents.loadURL(url.format({
      protocol: CR_EXTENSION_PROTOCOL,
      slashes: true,
      hostname: this.extension.id,
      pathname: this._name
    }))
  }

  /**
  * Stops background scripts
  * @param extension: the extension to stop
  */
  _stop (extension) {
    if (this._webContents && !this._webContents.isDestroyed()) {
      this._webContents.destroy()
    }
    this._webContents = undefined
    this._html = undefined
    this._name = undefined
  }

  /* ****************************************************************************/
  // Dev
  /* ****************************************************************************/

  /**
  * Opens the developer tools
  */
  openDevTools () {
    if (!this._webContents) { return }
    this._webContents.openDevTools()
  }
}

module.exports = CRExtensionBackgroundPage
