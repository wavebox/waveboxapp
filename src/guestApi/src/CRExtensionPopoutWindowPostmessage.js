/* global WB_API_KEY */

;(function () {
  window.opener = window.opener || {}
  const original = window.opener.postMessage

  window.opener.postMessage = function () {
    window.postMessage(JSON.stringify({
      wavebox: true,
      apiKey: WB_API_KEY,
      type: 'wavebox-crextension-popout-postmessage',
      arguments: Array.from(arguments),
      hasOriginal: original !== undefined
    }), '*')

    if (original) {
      original.apply(this, Array.from(arguments))
    }
  }
})()
