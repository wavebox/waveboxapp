const Browser = require('../Browser/Browser')
const WMail = require('../WMail/WMail')
const injector = require('../injector')

class MicrosoftStorageService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wmail = new WMail()

    injector.injectBodyEvent('DOMNodeInserted', this._handleDOMNodeInserted_)
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles a dom node being inserted by monkeypatching some form behaviour. Makes
  * create new document open in the current window
  */
  _handleDOMNodeInserted_ () {
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
  }
}

module.exports = MicrosoftStorageService
