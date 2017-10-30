import EventUnsupported from 'Core/EventUnsupported'

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

  /* **************************************************************************/
  // Methods
  /* **************************************************************************/

  getAll (details, callback) {
    console.warn('chrome.cookies.getAll is not supported by Wavebox at this time', details)
    setTimeout(() => {
      const res = []
      callback(res)
    })
  }
}

export default Cookies
