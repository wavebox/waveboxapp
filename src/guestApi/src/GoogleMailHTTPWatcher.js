'use strict'
/* global WB_API_KEY */

;(function () {
  const origSend = window.XMLHttpRequest.prototype.send
  window.XMLHttpRequest.prototype.send = function (...args) {
    const body = args[0]
    if (typeof (body) === 'string') {
      if (body.indexOf('"^a"') !== -1) {
        window.top.postMessage(JSON.stringify({
          apiKey: WB_API_KEY,
          wavebox: true,
          type: 'wavebox-gmail-http-request-archive-firing'
        }), '*')
      }
    }

    return origSend.apply(this, args)
  }
})()
