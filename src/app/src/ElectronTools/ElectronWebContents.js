import { webContents } from 'electron'
import { URL } from 'url'

class ElectronWebContents {
  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * Gets the root webcontents by crawling the hostWebContents tree
  * @param wc: the webcontents to look at
  * @return the topmost webcontents
  */
  static rootWebContents (wc) {
    let target = wc
    while (target.hostWebContents) {
      target = target.hostWebContents
    }
    return target
  }

  /**
  * Gets the host url for a webcontents. This helps when about:blank
  * is opened and the page has a parent
  * @param wc: the webcontents to look at
  * @return the host url
  */
  static getHostUrl (wc) {
    if (wc.isDestroyed()) {
      return 'about:blank'
    } else if (!wc.getURL() || wc.getURL() === 'about:blank') {
      const webPref = wc.getWebPreferences()
      if (webPref.openerId) {
        const opener = webContents.fromId(webPref.openerId)
        if (opener && !opener.isDestroyed()) {
          return opener.getURL()
        }
      }
      return 'about:blank'
    } else {
      return wc.getURL()
    }
  }

  /**
  * Gets the permission root url for a webcontents. This helps when about:blank
  * is opened and the page has a parent
  * @param wc: the webcontents to look at
  * @param currentUrl=undefined: the url reported by the page
  * @return the domain to run permissions off
  */
  static getPermissionRootUrl (wc, currentUrl = undefined) {
    const hostUrl = !currentUrl || currentUrl === 'about:blank' ? this.getHostUrl(wc) : currentUrl

    const purl = new URL(hostUrl || 'about:blank')
    const host = purl.hostname.startsWith('www.') ? purl.hostname.replace('www.', '') : purl.hostname
    return `${purl.protocol}//${host}`
  }
}

export default ElectronWebContents
