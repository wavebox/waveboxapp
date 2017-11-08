import fs from 'fs-extra'
import path from 'path'
import {
  CR_EXTENSION_PROTOCOL
} from 'shared/extensionApis'
import { renderProcessPreferences } from 'R/atomProcess'

class CRExtensionContentScript {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this._renderProcEntry = undefined

    this._start()
  }

  destroy () {
    this._stop()
  }

  /* ****************************************************************************/
  // Script lifecycle
  /* ****************************************************************************/

  /**
  * Starts the content scripts
  */
  _start () {
    if (!this.extension.manifest.hasContentScripts) { return }

    const entry = {
      extensionId: this.extension.id,
      popoutWindowPostmessageCapture: this.extension.manifest.popoutWindowPostmessageCapture,
      crExtensionContentScripts: this.extension.manifest.contentScripts.map((cs) => {
        return {
          matches: cs.matches,
          runAt: cs.runAt,
          js: cs.js.map((scriptPath) => {
            return {
              url: `${CR_EXTENSION_PROTOCOL}://${this.extension.id}/${scriptPath}`,
              code: String(fs.readFileSync(path.join(this.extension.srcPath, scriptPath)))
            }
          }),
          css: cs.css.map((scriptPath) => {
            return {
              url: `${CR_EXTENSION_PROTOCOL}://${this.extension.id}/${scriptPath}`,
              code: String(fs.readFileSync(path.join(this.extension.srcPath, scriptPath)))
            }
          })
        }
      })
    }
    this._renderProcEntry = renderProcessPreferences.addEntry(entry)
  }

  /**
  * Stops background scripts
  * @param extension: the extension to stop
  */
  _stop (extension) {
    if (this._renderProcEntry) {
      renderProcessPreferences.removeEntry(this._renderProcEntry)
      this._renderProcEntry = undefined
    }
  }
}

export default CRExtensionContentScript
