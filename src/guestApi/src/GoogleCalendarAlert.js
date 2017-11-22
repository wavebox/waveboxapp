/* global WB_API_KEY */

(function () {
  const polyfillAlert = function (window) {
    window.alert = function () {
      window.top.postMessage(JSON.stringify({
        apiKey: WB_API_KEY,
        wavebox: true,
        type: 'wavebox-alert-present',
        message: arguments[0]
      }), '*')
      return undefined
    }
  }
  polyfillAlert(window)
})()
