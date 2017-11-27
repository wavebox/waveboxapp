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


window.close = function () {
  console.log("CLOSE")
}

window.opener = new Proxy(window.opener || {}, {
  get:function (t,k) {
    console.log("window.opener."+k)
    if (k === 'closed') {
      return false
    } else if (k === 'location') {
      return new Proxy({}, {
        get: function (tt,kk) {
          console.log("window.opener."+k+"."+kk)
          if (kk === 'protocol') {
            return 'https:'
          } else if (kk === 'host') {
            return 'www.jacklmoore.com'
          }
          return tt[kk]
        }
      })
    } else if (k === 'parent' || k === 'top') {
      return t
    }
    return t[k]
  }
})
