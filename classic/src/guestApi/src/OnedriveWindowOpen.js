'use strict'
;(function () {
  if (window.location.host === 'onedrive.live.com' && window.location.pathname === '/create.aspx') {
    // On OneDrive After creating documents we get left at create.aspx, so take us back to oneDrive
    setTimeout(() => {
      window.history.back()
    }, 500)
  } else {
    /**
    * Handles a dom node being inserted by monkeypatching some form behaviour. Makes
    * create new document open in the current window
    */
    const createRewrite = setInterval(() => {
      if (!document.body) { return }

      clearInterval(createRewrite)
      document.body.addEventListener('DOMNodeInserted', () => {
        const forms = document.querySelectorAll('form')
        Array.from(forms).forEach((form) => {
          if (form.getAttribute('data-wavebox-patched')) { return }
          const originalSubmit = form.submit
          form.submit = function () {
            if (this.getAttribute('action').startsWith('/create.aspx') && this.getAttribute('target') === '_blank') {
              this.removeAttribute('target')
              return originalSubmit.apply(this, Array.from(arguments))
            } else {
              return originalSubmit.apply(this, Array.from(arguments))
            }
          }
          form.setAttribute('data-wavebox-patched', 'true')
        })
      }, false)
    }, 250)
  }
})()
