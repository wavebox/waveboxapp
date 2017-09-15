const { ipcRenderer } = require('electron')
const req = require('../../../../req')
const {
  CRX_GET_MANIFEST_,
  CRX_GET_MESSAGES_
} = req.shared('crExtensionIpcEvents')
const {
  CRExtensionManifest
} = req.shared('Models/CRExtension')

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

module.exports = ExtensionDatasource
