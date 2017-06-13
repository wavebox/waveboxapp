window.close = function () {
  window.postMessage(JSON.stringify({
    wavebox: true,
    type: 'WB_BROWSER_GUEST_WINDOW_CLOSE'
  }), '*')
}
