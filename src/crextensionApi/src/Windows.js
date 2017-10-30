import EventUnsupported from 'Core/EventUnsupported'

class Windows {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/apps/windows
  * @param extensionId: the id of the extension
  * @param hasTabsPermission: true if we have tabs permission
  */
  constructor (extensionId, hasTabsPermission) {
    this.onFocused = new EventUnsupported('chrome.windows.onFocused')
    this.onFocusChanged = new EventUnsupported('chrome.windows.onFocusChanged')

    Object.freeze(this)
  }
}

export default Windows
