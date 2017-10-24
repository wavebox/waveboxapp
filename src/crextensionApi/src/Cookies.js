import EventUnsupported from './Core/EventUnsupported'

class Cookies {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/cookies
  * @param extensionId: the id of the extension
  */
  constructor (extensionId) {
    this.onChanged = new EventUnsupported('chrome.cookies.onChanged')

    Object.freeze(this)
  }
}

export default Cookies
