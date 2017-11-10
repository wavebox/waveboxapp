import fs from 'fs-extra'
import {
  CR_EXTENSION_PROTOCOL
} from 'shared/extensionApis'
import { renderProcessPreferences } from 'R/atomProcess'
import { RENDER_PROCESS_PREFERENCE_TYPES } from 'shared/processPreferences'
import pathTool from 'shared/pathTool'

class CRExtensionContentScript {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param extension: the extension
  * @param datasource: the datasource object
  */
  constructor (extension, datasource) {
    this.extension = extension
    this.datasource = datasource
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

    const suggestedLocale = this.datasource.getSuggestedLocale()
    const entry = {
      type: RENDER_PROCESS_PREFERENCE_TYPES.WB_CREXTENSION_CONTENTSCRIPT_CONFIG,
      extensionId: this.extension.id,
      manifest: this.extension.manifest.cloneData(),
      messages: {
        [suggestedLocale]: this.datasource.getMessages(suggestedLocale)
      },
      crExtensionContentScripts: this.extension.manifest.contentScripts.map((cs) => {
        return {
          matches: cs.matches,
          runAt: cs.runAt,
          js: this._loadScripts(cs.js),
          css: this._loadScripts(cs.css)
        }
      })
    }
    this._renderProcEntry = renderProcessPreferences.addEntry(entry)
  }

  /**
  * Loads an array of scripts ready for the content script
  * @param scripts: the scripts to laod
  * @return an array of loaded scripts
  */
  _loadScripts (scripts) {
    return scripts
      .map((scriptPath) => {
        const scopedPath = pathTool.scopeToDir(this.extension.srcPath, scriptPath)
        if (scopedPath) {
          return {
            url: `${CR_EXTENSION_PROTOCOL}://${this.extension.id}/${scriptPath}`,
            code: String(fs.readFileSync(scopedPath))
          }
        } else {
          return undefined
        }
      })
      .filter((d) => !!d)
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
