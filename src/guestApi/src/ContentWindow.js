/* global WB_API_KEY */
;(function () {
  const originalWindowClose = window.close
  window.close = function () {
    window.postMessage(JSON.stringify({
      wavebox: true,
      apiKey: WB_API_KEY,
      type: 'WB_BROWSER_GUEST_WINDOW_CLOSE'
    }), '*')

    // Cover both bases in case we actually do have a window close and
    // nobodies listening on the polyfilled version. This can happen if a
    // ContentWindow was opened then a ContentPopupWindow on the same site
    // instance which has the same preload but no responder
    if (originalWindowClose) {
      setTimeout(() => { originalWindowClose() })
    }
  }
})()
