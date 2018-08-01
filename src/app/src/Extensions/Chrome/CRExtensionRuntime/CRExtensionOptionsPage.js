import {format as urlFormat} from 'url'
import { CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import ContentPopupWindow from 'Windows/ContentPopupWindow'
import { CRExtensionWebPreferences } from 'WebContentsManager'
import { WINDOW_BACKING_TYPES } from 'Windows/WindowBackingTypes'

const privOptionsWindow = Symbol('privOptionsWindow')

class CRExtensionOptionsPage {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this[privOptionsWindow] = null
  }

  destroy () {
    if (this.hasOpenWindow) { this[privOptionsWindow].destroy() }
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get hasOpenWindow () { return this[privOptionsWindow] && !this[privOptionsWindow].isDestroyed() }

  /* ****************************************************************************/
  // Launching
  /* ****************************************************************************/

  /**
  * Launches the options window
  */
  launchWindow () {
    if (this.hasOpenWindow) {
      this[privOptionsWindow].focus()
      return
    }

    const targetUrl = urlFormat({
      protocol: CR_EXTENSION_PROTOCOL,
      slashes: true,
      hostname: this.extension.id,
      pathname: this.extension.manifest.optionsPage
    })

    this[privOptionsWindow] = new ContentPopupWindow({
      backing: WINDOW_BACKING_TYPES.EXTENSION,
      extensionId: this.extension.id,
      extensionName: this.extension.manifest.name
    })
    this[privOptionsWindow].create(targetUrl, {
      title: this.extension.manifest.name,
      minWidth: 300,
      minHeight: 300,
      backgroundColor: '#FFFFFF',
      show: true,
      useContentSize: true,
      webPreferences: CRExtensionWebPreferences.defaultWebPreferences(this.extension.id)
    })

    // Bind event listeners
    this[privOptionsWindow].on('closed', () => {
      this[privOptionsWindow] = null
    })
  }
}

export default CRExtensionOptionsPage
