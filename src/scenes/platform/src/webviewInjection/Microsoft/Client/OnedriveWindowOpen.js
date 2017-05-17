(function () {
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
})()
