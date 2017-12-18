const privTabId = Symbol('privTabId')
const privRaw = Symbol('privRaw')

class Tab {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/tabs#type-Tab
  * @param tabIdOrTabData: the id of the tab or the raw tab data
  * @param raw={}: the raw tab config if the tab id is supplied as the first argument
  */
  constructor (tabIdOrTabData, raw = {}) {
    if (typeof (tabIdOrTabData) === 'object') {
      this[privTabId] = tabIdOrTabData.id
      this[privRaw] = tabIdOrTabData
    } else {
      this[privTabId] = tabIdOrTabData
      this[privRaw] = raw
    }

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
