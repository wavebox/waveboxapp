import { ipcRenderer } from 'electron'
import url from 'url'
import { WCRPC_SYNC_GET_OPENER_INFO } from 'shared/webContentsRPC'

class GuestHost {
  static get url () {
    if (window.location.href === 'about:blank') {
      if (window.opener && window.opener.location.href) {
        const openerInfo = ipcRenderer.sendSync(WCRPC_SYNC_GET_OPENER_INFO)
        if (openerInfo.hasOpener) {
          if (openerInfo.url === window.opener.location.href) {
            return window.opener.location.href
          }
        }
      }
    }
    return window.location.href
  }

  static get parsedUrl () {
    const u = this.url
    return u ? url.parse(u) : undefined
  }
}

export default GuestHost
