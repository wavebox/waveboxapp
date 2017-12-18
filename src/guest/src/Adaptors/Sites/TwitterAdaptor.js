import BaseAdaptor from './BaseAdaptor'
import { ipcRenderer } from 'electron'
import { WCRPC_DID_GET_REDIRECT_REQUEST } from 'shared/webContentsRPC'

class AsanaAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://twitter.com(*)'
    ]
  }
  static get hasJS () { return true }

  /* **************************************************************************/
  // JS
  /* **************************************************************************/

  executeJS () {
    // Workaround https://github.com/electron/electron/issues/3471
    ipcRenderer.on(WCRPC_DID_GET_REDIRECT_REQUEST, (evt, webContentsId, prevUrl, nextUrl, isMainFrame, httpResponseCode, requestMethod, referrer, headers) => {
      if (isMainFrame && requestMethod === 'POST' && httpResponseCode === 302) {
        setTimeout(() => {
          window.location.href = nextUrl
        }, 500)
      }
    })
  }
}

export default AsanaAdaptor
