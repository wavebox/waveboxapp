import {
  CR_EXTENSION_PROTOCOL
} from 'shared/extensionApis'
import Tab from 'Tabs/Tab'

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

export default MessageSender
