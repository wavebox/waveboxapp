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
  * @param tabIdOrTab: the id of the tab that sent the message or a prebuilt tab
  */
  constructor (extensionId, tabIdOrTab) {
    this.id = extensionId
    this.url = `${CR_EXTENSION_PROTOCOL}://${extensionId}`
    this.tab = typeof (tabIdOrTab) === 'object' ? tabIdOrTab : new Tab(tabIdOrTab)
    Object.freeze(this)
  }
}

export default MessageSender
