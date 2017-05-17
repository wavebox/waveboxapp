window.close = function () {
  window.postMessage(JSON.stringify({
    wavebox: true,
    type: 'guest-window-close'
  }), '*')
}
