const path = require('path')
const url = require('url')
const {
  CR_EXTENSION_PROTOCOL,
  CR_EXTENSION_BG_PARTITION_PREFIX
} = require('../../../../shared/extensionApis')
const ExtensionOptionsWindow = require('../../../windows/ExtensionOptionsWindow')
const appWindowManager = require('../../../appWindowManager')

const PRELOAD_PATH = path.join(__dirname, '../../../../../guest/guest/crextensionOptionsTooling.js')

class CRExtensionOptionsPage {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this._optionsWindow = null
  }

  destroy () {
    if (this.hasOpenWindow) { this._optionsWindow.destroy() }
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get hasOpenWindow () { return this._optionsWindow && !this._optionsWindow.isDestroyed() }

  /* ****************************************************************************/
  // Launching
  /* ****************************************************************************/

  /**
  * Launches the options window
  */
  launchWindow () {
    if (this.hasOpenWindow) {
      this._optionsWindow.focus()
      return
    }

    const targetUrl = url.format({
      protocol: CR_EXTENSION_PROTOCOL,
      slashes: true,
      hostname: this.extension.id,
      pathname: this.extension.manifest.optionsPage
    })
    const options = {
      useContentSize: true,
      title: this.extension.manifest.name,
      webPreferences: {
        nodeIntegration: false,
        preload: PRELOAD_PATH,
        partition: `${CR_EXTENSION_BG_PARTITION_PREFIX}${this.extension.id}`
      }
    }

    this._optionsWindow = new ExtensionOptionsWindow()
    appWindowManager.addContentWindow(this._optionsWindow)
    this._optionsWindow.create(targetUrl, options)

    // Bind event listeners
    this._optionsWindow.on('closed', () => {
      this._optionsWindow = null
    })
  }
}

module.exports = CRExtensionOptionsPage
