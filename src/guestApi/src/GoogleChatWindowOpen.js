'use strict'
;(function () {
  /**
  * Patches the window open command for a given window
  * @param window: the window to patch
  */
  const patchWindowOpen = function (window) {
    const defaultOpenFn = window.open
    window.open = function () {
      if (arguments[0] === '' && arguments[1] === '_blank') {
        // Open external links
        const windowRef = defaultOpenFn.apply(window, Array.from(arguments))
        return new Proxy(windowRef, {
          get: (target, key) => {
            if (key === 'document') {
              return new Proxy(target.document, {
                get: (target, key) => {
                  if (key === 'write') {
                    return function (value) {
                      try {
                        const parser = new window.DOMParser()
                        const xml = parser.parseFromString(value, 'text/xml')
                        const redirect = xml.querySelector('meta[http-equiv="refresh"], meta[HTTP-EQUIV="refresh"], META[http-equiv="refresh"], META[HTTP-EQUIV="refresh"]')
                        if (redirect) {
                          const content = redirect.getAttribute('content')
                          const urlDefIndex = content.indexOf('url=')
                          if (urlDefIndex !== -1) {
                            // GoogleChat sits link open events over anchor tags. If we open the link, we actually get
                            // two links opens. So instead check that the link is a google redirect and if it is
                            // inaction it. This will cause the anchor tag to open the external link, which has the desired
                            // effect
                            const url = content.slice(urlDefIndex + 4).split(' ')[0]
                            if (url.startsWith('https://www.google.com/url?')) {
                              windowRef.close()
                              return
                            }
                          }
                        }
                      } catch (ex) { /* no-op */ }

                      // Default behaviour
                      target.write.apply(target, Array.from(arguments))
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
  }

  /**
  * Patches the window open command in a given iframe
  * @param iframe: the iframe to patch
  */
  const patchIframeWindowOpen = function (iframe) {
    if (iframe.getAttribute('data-wavebox-patched')) { return }

    try {
      patchWindowOpen(iframe.contentWindow)
    } catch (ex) {
      /* no-op */
    }
    iframe.setAttribute('data-wavebox-patched', 'true')
  }

  /**
  * Patches all iframes with the window open code
  */
  const patchAllIframeWindowOpen = function () {
    Array.from(document.body.querySelectorAll('iframe:not([data-wavebox-patched])')).forEach((element) => {
      patchIframeWindowOpen(element)
    })
  }

  // Start
  patchWindowOpen(window)
  document.addEventListener('DOMContentLoaded', () => {
    patchAllIframeWindowOpen()
  }, false)
  document.addEventListener('DOMNodeInserted', (evt) => {
    if (evt.target.tagName === 'IFRAME') {
      patchIframeWindowOpen(evt.target)
    } else {
      if (document.body) {
        patchAllIframeWindowOpen()
      }
    }
  })
})()
