import url from 'url'
import {
  CR_EXTENSION_PROTOCOL,
  CR_EXTENSION_BG_PARTITION_PREFIX
} from 'shared/extensionApis'
import ExtensionOptionsWindow from 'windows/ExtensionOptionsWindow'
import Resolver from 'Runtime/Resolver'

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
        preload: Resolver.crExtensionApi(),
        partition: `${CR_EXTENSION_BG_PARTITION_PREFIX}${this.extension.id}`
      }
    }

    this._optionsWindow = new ExtensionOptionsWindow()
    this._optionsWindow.create(targetUrl, options)

    // Bind event listeners
    this._optionsWindow.on('closed', () => {
      this._optionsWindow = null
    })
  }
}

export default CRExtensionOptionsPage
