(function () {
  const defaultOpenFn = window.open
  window.open = function () {
    if (arguments[0] === '' && arguments[1] === '_blank') {
      // Preview draft links, open Github Issues
      const windowRef = defaultOpenFn.apply(window, Array.from(arguments))
      return new Proxy(windowRef, {
        get: (target, key) => {
          if (key === 'document') {
            return new Proxy(target.document, {
              get: (target, key) => {
                if (key === 'write') {
                  return function (value) {
                    if (value.startsWith('<META HTTP-EQUIV="refresh" content="0')) {
                      const parser = new window.DOMParser()
                      const xml = parser.parseFromString(value, 'text/xml')
                      const content = xml.firstChild.getAttribute('content')
                      const url = content.replace('0; url=', '')
                      defaultOpenFn(url)
                      windowRef.close()
                    } else {
                      target.write.apply(target, Array.from(arguments))
                    }
                  }
                } else {
                  return target[key]
                }
              }
            })
          } else {
            return target[key]
          }
        }
      })
    } else {
      return defaultOpenFn.apply(window, Array.from(arguments))
    }
  }
})()
