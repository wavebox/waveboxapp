/* global WB_API_KEY */

window.close = function () {
  window.postMessage(JSON.stringify({
    wavebox: true,
    apiKey: WB_API_KEY,
    type: 'WB_BROWSER_GUEST_WINDOW_CLOSE'
  }), '*')
}
