'use strict'
;(function () {
  /**
  * Patches the window open command for a given window
  * @param window: the window to patch
  */
  const patchWindowOpen = function (window) {
    const defaultOpenFn = window.open
    window.open = function () {
      if (arguments.length === 0) {
        const windowRef = defaultOpenFn.apply(window, Array.from(arguments))
        let captureCount = 0
        return new Proxy(windowRef, {
          get: (target, key) => {
            captureCount++
            if (key === 'location') {
              return new Proxy(target[key], {
                get: (target, key) => {
                  return target[key]
                },
                set: (target, key, value) => {
                  captureCount++
                  if (key === 'href' && captureCount === 2) { // window.location.href =
                    defaultOpenFn(value)
                    windowRef.close()
                    return true
                  }

                  target[key] = value
                  return true
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
