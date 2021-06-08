import Tab from 'Tabs/Tab'

class MessageSender {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/runtime#type-MessageSender
  * @param extensionId: the id of the extension that sent the message
  * @param connectedParty: the other connected party that opened the connection { tabId, url, tab }
  */
  constructor (extensionId, connectedParty) {
    this.id = extensionId
    this.url = connectedParty.url
    this.tab = new Tab(connectedParty.tab || connectedParty.tabId)
    Object.freeze(this)
  }
}

export default MessageSender
