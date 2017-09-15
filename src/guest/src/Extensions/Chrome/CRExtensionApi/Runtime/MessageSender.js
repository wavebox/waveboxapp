const req = require('../../../../req')
const {
  CR_EXTENSION_PROTOCOL
} = req.shared('extensionApis.js')
const Tab = require('../Tabs/Tab')

class MessageSender {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/runtime#type-MessageSender
  * @param extensionId: the id of the extension that sent the message
  * @param tabId: the id of the tab that sent the message
  */
  constructor (extensionId, tabId) {
    this.id = extensionId
    this.url = `${CR_EXTENSION_PROTOCOL}://${extensionId}`
    this.tab = new Tab(tabId)
    Object.freeze(this)
  }
}

module.exports = MessageSender
