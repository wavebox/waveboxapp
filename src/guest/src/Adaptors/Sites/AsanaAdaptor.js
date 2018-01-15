import BaseAdaptor from './BaseAdaptor'
import { ipcRenderer } from 'electron'
import { WCRPC_DOM_READY } from 'shared/webContentsRPC'

class AsanaAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://app.asana.com/-/login(*)'
    ]
  }
  static get hasJS () { return true }

  /* **************************************************************************/
  // JS
  /* **************************************************************************/

  executeJS () {
    let patchInterval = setInterval(() => {
      const googleLoginButton = document.querySelector('#google_auth_button')
      if (googleLoginButton) {
        const willChange = googleLoginButton.getAttribute('onclick').indexOf('loginWithGoogle(false,') !== -1
        const patched = googleLoginButton.getAttribute('onclick')
          .replace('loginWithGoogle(false,', 'loginWithGoogle(true,')
        googleLoginButton.setAttribute('onclick', patched)

        if (willChange) {
          clearInterval(patchInterval)
          patchInterval = null
        }
      }
    }, 100)

    ipcRenderer.on(WCRPC_DOM_READY, () => {
      if (patchInterval !== null) {
        setTimeout(() => {
          clearInterval(patchInterval)
        }, 2000)
      }
    })
  }
}

export default AsanaAdaptor
