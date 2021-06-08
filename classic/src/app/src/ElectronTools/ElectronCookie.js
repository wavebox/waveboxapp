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

  /**
  * Generates a cookie header for a given url
  * @param cookies: the cookies object from the session
  * @param url: the url to generate for
  * @return promise
  */
  static cookieHeaderForUrl (cookies, url) {
    return new Promise((resolve, reject) => {
      cookies.get({ url: url }, (err, cookies) => {
        if (err) {
          reject(err)
        } else {
          resolve(
            (cookies || []).map((c) => `${c.name}=${c.value}`).join(';')
          )
        }
      })
    })
  }
}

export default ElectronCookie
