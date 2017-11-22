import { ipcMain, app } from 'electron'
import fs from 'fs-extra'
import {
  CRX_GET_MANIFEST_,
  CRX_GET_MESSAGES_
} from 'shared/crExtensionIpcEvents'

class CRExtensionDatasource {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.messages = new Map()

    ipcMain.on(`${CRX_GET_MANIFEST_}${this.extension.id}`, this.handleGetManifest)
    ipcMain.on(`${CRX_GET_MESSAGES_}${this.extension.id}`, this.handleGetMessages)
  }

  destroy () {
    ipcMain.removeListener(`${CRX_GET_MANIFEST_}${this.extension.id}`, this.handleGetManifest)
    ipcMain.removeListener(`${CRX_GET_MESSAGES_}${this.extension.id}`, this.handleGetMessages)
  }

  /* ****************************************************************************/
  // Data getters
  /* ****************************************************************************/

  /**
  * Gets the messages for the given language
  * @param language: the language to get the messages for
  * @return the messages or an empty object if the load failed
  */
  getMessages (language) {
    if (!this.messages.has(language)) {
      let messages
      try {
        messages = fs.readJsonSync(this.extension.getMessagesPath(language))
      } catch (ex) {
        try {
          messages = fs.readJsonSync(this.extension.getMessagesPath(this.extension.manifest.defaultLocale))
        } catch (ex) {
          messages = {}
        }
      }
      this.messages.set(language, messages)
    }

    return this.messages.get(language)
  }

  /**
  * Gets the suggested locale
  * @return language code
  */
  getSuggestedLocale () {
    return app.getLocale().replace(/-.*$/, '').toLowerCase()
  }

  /* ****************************************************************************/
  // Handlers: Getters
  /* ****************************************************************************/

  /**
  * Gets a manifest
  * @param evt: the event that fired
  */
  handleGetManifest = (evt) => {
    evt.returnValue = this.extension.manifest.cloneData()
  }

  /**
  * Gets the messages for a specific language
  * @param evt: the event that fired
  * @param language: the language to get the messages for
  */
  handleGetMessages = (evt, language) => {
    evt.returnValue = this.getMessages(language)
  }
}

export default CRExtensionDatasource
