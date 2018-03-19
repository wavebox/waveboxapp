import { ipcRenderer } from 'electronCrx'
import {
  CRX_GET_MANIFEST_,
  CRX_GET_MESSAGES_
} from 'shared/crExtensionIpcEvents'
import { CRExtensionManifest } from 'shared/Models/CRExtension'

const privExtensionId = Symbol('privExtensionId')
const privManifest = Symbol('privManifest')
const privMessages = Symbol('privMessages')
const privXHRToken = Symbol('privXHRToken')

class ExtensionDatasource {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param extensionId: the id of the extension
  * @param runtimeConfig: the runtime config to extract data from
  */
  constructor (extensionId, runtimeConfig) {
    this[privExtensionId] = extensionId
    this[privManifest] = undefined
    this[privMessages] = new Map()
    this[privXHRToken] = ''

    // Populate
    if (runtimeConfig) {
      if (runtimeConfig.manifest) {
        this[privManifest] = new CRExtensionManifest(runtimeConfig.manifest)
      }
      if (runtimeConfig.messages) {
        for (let lang in runtimeConfig.messages) {
          this[privMessages].set(lang, runtimeConfig.messages[lang])
        }
      }
      if (runtimeConfig.xhrToken) {
        this[privXHRToken] = runtimeConfig.xhrToken
      }
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get manifest () {
    if (!this[privManifest]) {
      const manifestData = ipcRenderer.sendSync(`${CRX_GET_MANIFEST_}${this[privExtensionId]}`)
      if (!manifestData) {
        throw new Error(`Unable to get manifest data for ${this[privExtensionId]}`)
      }
      this[privManifest] = new CRExtensionManifest(manifestData)
    }
    return this[privManifest]
  }

  get xhrToken () { return this[privXHRToken] }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  /**
  * Gets the messages for this extension
  */
  getMessages (language) {
    if (!this[privMessages].has(language)) {
      const messages = ipcRenderer.sendSync(`${CRX_GET_MESSAGES_}${this[privExtensionId]}`, language)
      this[privMessages].set(language, messages)
    }

    return this[privMessages].get(language)
  }
}

export default ExtensionDatasource
