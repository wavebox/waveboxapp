import fs from 'fs-extra'
import {
  CR_EXTENSION_PROTOCOL
} from 'shared/extensionApis'
import { renderProcessPreferences } from 'R/atomProcess'
import { RENDER_PROCESS_PREFERENCE_TYPES } from 'shared/processPreferences'
import pathTool from 'shared/pathTool'
import uuid from 'uuid'

const privRenderProcEntry = Symbol('privRenderProcEntry')
const privXHRToken = Symbol('privXHRToken')

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
    this[privRenderProcEntry] = undefined
    this[privXHRToken] = uuid.v4()

    this._start()
  }

  destroy () {
    this._stop()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get xhrToken () { return this[privXHRToken] }

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
      xhrToken: this[privXHRToken],
      crExtensionContentScripts: this.extension.manifest.contentScripts.map((cs) => {
        return {
          matches: cs.matches,
          runAt: cs.runAt,
          js: this._loadScripts(cs.js),
          css: this._templateCSSScripts(this._loadScripts(cs.css))
        }
      })
    }
    this[privRenderProcEntry] = renderProcessPreferences.addEntry(entry)
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
  * Replaces template keywords in css files
  * @param scripts: the loaded scripts in the format [{ url, code }, ...]
  * @return the scripts in the same format with templating applied
  */
  _templateCSSScripts (scripts) {
    return scripts.map(({ url, code }) => {
      return {
        url: url,
        code: code.replace(/__MSG_@@extension_id__/g, this.extension.id)
      }
    })
  }

  /**
  * Stops background scripts
  * @param extension: the extension to stop
  */
  _stop (extension) {
    if (this[privRenderProcEntry]) {
      renderProcessPreferences.removeEntry(this[privRenderProcEntry])
      this[privRenderProcEntry] = undefined
    }
  }
}

export default CRExtensionContentScript
