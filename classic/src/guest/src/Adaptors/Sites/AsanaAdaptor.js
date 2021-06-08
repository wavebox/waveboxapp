import BaseAdaptor from './BaseAdaptor'
import WBRPCRenderer from 'shared/WBRPCRenderer'

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

    WBRPCRenderer.webContents.once('dom-ready', () => {
      if (patchInterval !== null) {
        setTimeout(() => {
          clearInterval(patchInterval)
        }, 2000)
      }
    })
  }
}

export default AsanaAdaptor
