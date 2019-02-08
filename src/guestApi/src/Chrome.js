'use strict'

;(function () {
  window.chrome = {}

  if (window.location.hostname === 'drive.google.com') {
    window.chrome.runtime = {
      connect: function (extensionId, args) {
        return {
          name: (args || {}).name,
          sender: undefined,
          postMessage: function () { },
          disconnect: function () { },
          ...['onDisconnect', 'onMessage'].reduce((acc, k) => {
            acc[k] = {
              addListener: function () { },
              dispatch: function () { },
              hasListener: function () { },
              hasListeners: function () { },
              removeListener: function () { },
              removeAllListenrs: function () { }
            }
            return acc
          }, {})
        }
      }
    }
  }

  if (window.location.hostname === 'docs.google.com') {
    window._docs_chrome_extension_exists = true
    window._docs_chrome_extension_permissions = [
      'clipboardRead',
      'clipboardWrite'
    ]
  }

  // Drop support: https://github.com/electron/electron/issues/7150
  delete window.PasswordCredential
})()
