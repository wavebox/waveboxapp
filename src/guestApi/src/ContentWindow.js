/* global WB_API_KEY */
;(function () {
  const originalWindowClose = window.close
  window.close = function () {
    // If the original closer is available make sure we call that first
    // Failure to do so can cause the cross-window opening code to fail
    // on some calls in the opening window
    let retValue
    if (originalWindowClose) {
      retValue = originalWindowClose()
    }

    // Requeue the polyfilled call
    setTimeout(() => {
      window.postMessage(JSON.stringify({
        wavebox: true,
        apiKey: WB_API_KEY,
        type: 'WB_BROWSER_GUEST_WINDOW_CLOSE'
      }), '*')
    })

    return retValue
  }
})()
