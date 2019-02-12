import BaseAdaptor from './BaseAdaptor'
import { ipcRenderer } from 'electron'
import { WCRPC_DOM_READY } from 'shared/webContentsRPC'

class SlackAdapator extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://*.slack.com(*)'
    ]
  }
  static get hasJS () { return true }

  /* **************************************************************************/
  // Class: CSS
  /* **************************************************************************/

  static get styles () { return '#macssb1_banner { display:none; }' }

  /* **************************************************************************/
  // JS
  /* **************************************************************************/

  executeJS () {
    // Handle slack redirect to app page
    ipcRenderer.once(WCRPC_DOM_READY, () => {
      if (window.location.pathname.startsWith('/archives')) {
        const fallback = document.querySelector('.deeplink .fallback > a')
        if (fallback) {
          fallback.click()
        }
      }
    })
  }
}

export default SlackAdapator
