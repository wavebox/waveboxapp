import BaseAdaptor from './BaseAdaptor'
import WBRPCRenderer from 'shared/WBRPCRenderer'

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
    WBRPCRenderer.webContents.once('dom-ready', () => {
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
