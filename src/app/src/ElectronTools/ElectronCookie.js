import { URL } from 'url'

class ElectronCookie {
  /* ****************************************************************************/
  // Polyfills
  /* ****************************************************************************/

  /**
  * Generates a pseudo url for a cookie
  */
  static urlForCookie (cookie) {
    if (cookie.url) { return cookie.url }
    return new URL(cookie.path, `${cookie.secure ? 'https://' : 'http://'}${cookie.host}`).toString()
  }
}

export default ElectronCookie
