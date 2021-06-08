import fs from 'fs-extra'
import {
  CR_EXTENSION_PROTOCOL
} from 'shared/extensionApis'
import pathTool from 'shared/pathTool'
import uuid from 'uuid'

const privXHRToken = Symbol('privXHRToken')
const privCachedGuestConfig = Symbol('privCachedGuestConfig')
const privCachedRuntimeConfig = Symbol('privCachedRuntimeConfig')

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
    this[privXHRToken] = uuid.v4()
    this[privCachedGuestConfig] = null
    this[privCachedRuntimeConfig] = null
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get xhrToken () { return this[privXHRToken] }
  get guestConfig () {
    if (!this.extension.manifest.hasContentScripts) { return undefined }

    if (this[privCachedGuestConfig] === null) {
      this[privCachedGuestConfig] = this._generateGuestConfig()
    }

    return this[privCachedGuestConfig]
  }
  get runtimeConfig () {
    if (!this.extension.manifest.hasContentScripts) { return undefined }

    if (this[privCachedRuntimeConfig] === null) {
      this[privCachedRuntimeConfig] = this._generateRuntimeConfig()
    }

    return this[privCachedRuntimeConfig]
  }

  /* ****************************************************************************/
  // Script lifecycle
  /* ****************************************************************************/

  /**
  * Generates the guest config
  * @return the config or undefined
  */
  _generateGuestConfig () {
    const suggestedLocale = this.datasource.getSuggestedLocale()
    return {
      extensionId: this.extension.id,
      manifest: this.extension.manifest.cloneData(),
      contentSecurityPolicy: this.extension.manifest.contentSecurityPolicy,
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
  }

  /**
  * Generates the runtime config
  * @return the config or undefined
  */
  _generateRuntimeConfig () {
    const suggestedLocale = this.datasource.getSuggestedLocale()
    return {
      manifest: this.extension.manifest.cloneData(),
      messages: {
        [suggestedLocale]: this.datasource.getMessages(suggestedLocale)
      },
      xhrToken: this[privXHRToken]
    }
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
}

export default CRExtensionContentScript
