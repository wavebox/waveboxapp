'use strict'
/* global WB_API_KEY */

;(function () {
  let asyncAlert = true
  window.addEventListener('message', function (evt) {
    if (evt.origin === window.location.origin && evt.isTrusted) {
      let data
      try {
        data = JSON.parse(evt.data)
      } catch (ex) { return }
      if (!data.wavebox) { return }

      if (data.type === 'wavebox-configure-alert') {
        asyncAlert = data.async
      }
    }
  }, false)

  const polyfillAlert = function (window) {
    const original = window.alert
    window.alert = function (message) {
      window.top.postMessage(JSON.stringify({
        apiKey: WB_API_KEY,
        wavebox: true,
        type: 'wavebox-alert-present',
        message: message
      }), '*')
      if (asyncAlert) {
        return undefined
      } else {
        return original(message)
      }
    }
  }

  const polyfillConfirm = function (window) {
    const original = window.confirm
    window.confirm = function (message) {
      window.top.postMessage(JSON.stringify({
        apiKey: WB_API_KEY,
        wavebox: true,
        type: 'wavebox-confirm-present',
        message: message
      }), '*')
      return original(message)
    }
  }

  polyfillAlert(window)
  polyfillConfirm(window)
})()
