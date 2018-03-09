'use strict'

;(function () {
  window.chrome = {}

  if (window.location.hostname === 'docs.google.com') {
    window._docs_chrome_extension_exists = true
    window._docs_chrome_extension_permissions = [
      'clipboardRead',
      'clipboardWrite'
    ]
  }
})()
