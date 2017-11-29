import url from 'url'

class ElectronCookie {
  /* ****************************************************************************/
  // Polyfills
  /* ****************************************************************************/

  /**
  * Generates a pseudo url for a cookie
  */
  static urlForCookie (cookie) {
    if (cookie.url) { return cookie.url }
    return url.format({
      protocol: cookie.secure ? 'https:' : 'http:',
      host: cookie.domain,
      path: cookie.path
    })
  }
}

export default ElectronCookie
