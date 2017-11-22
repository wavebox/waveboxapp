import { ipcRenderer } from 'electronCrx'
import {
  CRX_GET_MANIFEST_,
  CRX_GET_MESSAGES_
} from 'shared/crExtensionIpcEvents'
import { CRExtensionManifest } from 'shared/Models/CRExtension'
import { RENDER_PROCESS_PREFERENCE_TYPES } from 'shared/processPreferences'

const privExtensionId = Symbol('privExtensionId')
const privManifest = Symbol('privManifest')
const privMessages = Symbol('privMessages')

class ExtensionDatasource {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param extensionId: the id of the extension
  */
  constructor (extensionId) {
    this[privExtensionId] = extensionId
    this[privManifest] = undefined
    this[privMessages] = new Map()

    // Populate from the render preferences
    const preferences = process.getRenderProcessPreferences()
    if (preferences) {
      for (const pref of preferences) {
        if (pref.type === RENDER_PROCESS_PREFERENCE_TYPES.WB_CREXTENSION_CONTENTSCRIPT_CONFIG && pref.extensionId === extensionId) {
          if (pref.manifest) {
            this[privManifest] = new CRExtensionManifest(pref.manifest)
          }
          if (pref.messages) {
            for (let lang in pref.messages) {
              this[privMessages].set(lang, pref.messages[lang])
            }
          }
          break
        }
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
