const privTabId = Symbol('privTabId')
const privRaw = Symbol('privRaw')

class Tab {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/tabs#type-Tab
  * @param tabId: the id of the tab
  * @param raw={}: the raw tab config
  */
  constructor (tabId, raw = {}) {
    this[privTabId] = tabId
    this[privRaw] = raw

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this[privTabId] }
  get index () { return 0 }
  get windowId () { return this[privRaw].windowId }
  get url () { return this[privRaw].url }
  get title () { return this[privRaw].title }
  get active () { return this[privRaw].active }
}

export default Tab
