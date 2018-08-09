import CRExtensionI18n from 'shared/Models/CRExtension/CRExtensionI18n'

const privExtensionId = Symbol('privExtensionId')
const privExtensionDatasource = Symbol('privExtensionDatasource')

class I18n {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/i18n
  * @param extensionId: the id of the extension
  * @param extensionDatasource: the datasource for the extension
  */
  constructor (extensionId, extensionDatasource) {
    this[privExtensionId] = extensionId
    this[privExtensionDatasource] = extensionDatasource
  }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  getMessage (messageName, substitutions = []) {
    const messages = this[privExtensionDatasource].getMessages(this.getUILanguage())
    return CRExtensionI18n.translate(messages, messageName, substitutions)
  }

  getUILanguage () { return navigator.language.replace(/-.*$/, '').toLowerCase() }

  getAcceptLanguages (cb) {
    setTimeout(() => {
      const res = [this.getUILanguage()]
      cb(res)
    })
  }
}

export default I18n
