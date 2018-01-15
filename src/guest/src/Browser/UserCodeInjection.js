import { ipcRenderer, webFrame } from 'electron'
import { WB_BROWSER_INJECT_CUSTOM_CONTENT } from 'shared/ipcEvents'

class UserCodeInjection {
  constructor () {
    ipcRenderer.on(WB_BROWSER_INJECT_CUSTOM_CONTENT, this._handleInject)
  }

  /**
  * Injects the custom CSS and JS to the current page
  */
  _handleInject = (evt, data) => {
    if (data.js) { webFrame.executeJavaScript(data.js) }
    if (data.css) { this._injectCSS(data.css) }
  }

  /**
  * Injects the css to the current page. Logically you would use webFrame.insertCSS() to do this
  * but typically the user wants their CSS to overwrite that of the page. To do this in the most
  * reliable way insert the style element between </head> and <body>. In terms of HTML5-correctness,
  * style elements should only be within the head but this ensures the user styles have precidence
  * over most of what is added to the page and avoids them needing to !important pretty much everything
  */
  _injectCSS (css) {
    if (document.head) {
      const styleEl = document.createElement('style')
      styleEl.innerHTML = css

      const htmlEl = document.head.parentNode
      if (htmlEl.lastChild === document.head) {
        htmlEl.appendChild(styleEl)
      } else {
        htmlEl.insertBefore(styleEl, document.head.nextSibling)
      }
    } else {
      setTimeout(() => { this._injectCSS(css) }, 10)
    }
  }
}

export default UserCodeInjection
