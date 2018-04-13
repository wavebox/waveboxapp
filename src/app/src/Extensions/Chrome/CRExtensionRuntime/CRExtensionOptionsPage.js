import {format as urlFormat} from 'url'
import { CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import ExtensionHostedWindow from 'Windows/ExtensionHostedWindow'

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

    const targetUrl = urlFormat({
      protocol: CR_EXTENSION_PROTOCOL,
      slashes: true,
      hostname: this.extension.id,
      pathname: this.extension.manifest.optionsPage
    })

    this._optionsWindow = new ExtensionHostedWindow(this.extension.id, this.extension.manifest.name)
    this._optionsWindow.create(targetUrl, { useContentSize: true })

    // Bind event listeners
    this._optionsWindow.on('closed', () => {
      this._optionsWindow = null
    })
  }
}

export default CRExtensionOptionsPage
