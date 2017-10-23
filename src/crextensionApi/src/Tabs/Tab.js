class Tab {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/tabs#type-Tab
  * @param tabId: the id of the tab
  */
  constructor (tabId) {
    this.id = tabId
    Object.freeze(this)
  }
}

export default Tab
