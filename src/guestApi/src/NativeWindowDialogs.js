/* global WB_API_KEY */

(function () {
  const polyfillAlert = function (window) {
    window.alert = function (message) {
      window.top.postMessage(JSON.stringify({
        apiKey: WB_API_KEY,
        wavebox: true,
        type: 'wavebox-alert-present'
      }), '*')
      const proxy = document.createElement('iframe')
      proxy.style.display = 'none'
      document.body.appendChild(proxy)

      const response = proxy.contentWindow.alert(message)

      document.body.removeChild(proxy)
      return response
    }
  }

  const polyfillConfirm = function (window) {
    window.confirm = function (message) {
      window.top.postMessage(JSON.stringify({
        apiKey: WB_API_KEY,
        wavebox: true,
        type: 'wavebox-confirm-present'
      }), '*')
      const proxy = document.createElement('iframe')
      proxy.style.display = 'none'
      document.body.appendChild(proxy)

      const response = proxy.contentWindow.confirm(message)

      document.body.removeChild(proxy)
      return response
    }
  }

  // Requeue - the default injector seems to come in first
  setTimeout(() => {
    polyfillAlert(window)
    polyfillConfirm(window)
  })
})()
