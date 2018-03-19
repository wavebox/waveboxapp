import BaseAdaptor from './BaseAdaptor'
import { ipcRenderer } from 'electron'
import { WCRPC_DOM_READY } from 'shared/webContentsRPC'

class TrelloAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://trello.com(*)'
    ]
  }
  static get hasJS () { return true }

  /* **************************************************************************/
  // Class: CSS
  /* **************************************************************************/

  static get styles () {
    return `
      .wavebox-pdf-iframe-preview-enabled {
        display: none;
      }
      .wavebox-pdf-preview-pane {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #FFF;
        color: #000;
        cursor: pointer;
        border-radius: 3px;
      }
      .wavebox-pdf-preview-pane>.wavebox-pdf-icon {
        width: 125px;
        height: 125px;
        opacity: 0.25;
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODQgNTEyIj48cGF0aCBkPSJNMzY5LjkgOTcuOUwyODYgMTRDMjc3IDUgMjY0LjgtLjEgMjUyLjEtLjFINDhDMjEuNSAwIDAgMjEuNSAwIDQ4djQxNmMwIDI2LjUgMjEuNSA0OCA0OCA0OGgyODhjMjYuNSAwIDQ4LTIxLjUgNDgtNDhWMTMxLjljMC0xMi43LTUuMS0yNS0xNC4xLTM0ek0zMzIuMSAxMjhIMjU2VjUxLjlsNzYuMSA3Ni4xek00OCA0NjRWNDhoMTYwdjEwNGMwIDEzLjMgMTAuNyAyNCAyNCAyNGgxMDR2Mjg4SDQ4em0yNTAuMi0xNDMuN2MtMTIuMi0xMi00Ny04LjctNjQuNC02LjUtMTcuMi0xMC41LTI4LjctMjUtMzYuOC00Ni4zIDMuOS0xNi4xIDEwLjEtNDAuNiA1LjQtNTYtNC4yLTI2LjItMzcuOC0yMy42LTQyLjYtNS45LTQuNCAxNi4xLS40IDM4LjUgNyA2Ny4xLTEwIDIzLjktMjQuOSA1Ni0zNS40IDc0LjQtMjAgMTAuMy00NyAyNi4yLTUxIDQ2LjItMy4zIDE1LjggMjYgNTUuMiA3Ni4xLTMxLjIgMjIuNC03LjQgNDYuOC0xNi41IDY4LjQtMjAuMSAxOC45IDEwLjIgNDEgMTcgNTUuOCAxNyAyNS41IDAgMjgtMjguMiAxNy41LTM4Ljd6bS0xOTguMSA3Ny44YzUuMS0xMy43IDI0LjUtMjkuNSAzMC40LTM1LTE5IDMwLjMtMzAuNCAzNS43LTMwLjQgMzV6bTgxLjYtMTkwLjZjNy40IDAgNi43IDMyLjEgMS44IDQwLjgtNC40LTEzLjktNC4zLTQwLjgtMS44LTQwLjh6bS0yNC40IDEzNi42YzkuNy0xNi45IDE4LTM3IDI0LjctNTQuNyA4LjMgMTUuMSAxOC45IDI3LjIgMzAuMSAzNS41LTIwLjggNC4zLTM4LjkgMTMuMS01NC44IDE5LjJ6bTEzMS42LTVzLTUgNi0zNy4zLTcuOGMzNS4xLTIuNiA0MC45IDUuNCAzNy4zIDcuOHoiLz48L3N2Zz4=");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        margin: 32px;
      }
      .wavebox-pdf-preview-pane>.wavebox-pdf-button {
        cursor: pointer;
        margin: 0;
        border: 0;
        display: inline-flex;
        padding: 8px 16px;
        outline: none;
        position: relative;
        user-select: none;
        align-items: center;
        border-radius: 0;
        vertical-align: middle;
        justify-content: center;
        text-decoration: none;
        -webkit-appearance: none;
        -webkit-tap-highlight-color: transparent;
        min-width: 88px;
        font-size: 0.875rem;
        box-sizing: border-box;
        min-height: 36px;
        transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        line-height: 1.4em;
        border-radius: 2px;
        box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12);
        color: #fff;
        background-color: #2196f3;
      }
      .wavebox-pdf-preview-pane>.wavebox-pdf-button:active {
        box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
      }
      .wavebox-pdf-preview-pane>.wavebox-pdf-button:hover {
        background-color: #1976d2;
      }
      .wavebox-pdf-auto-open-setting {
        display: block;
        margin-top: 16px;
        font-weight: normal;
        color: #666;
      }
    `
  }

  /* **************************************************************************/
  // JS
  /* **************************************************************************/

  executeJS () {
    this.pdfObserver = new window.MutationObserver((mutations) => {
      const frames = document.body.querySelectorAll('iframe.attachment-viewer-frame-preview-iframe[src*=".pdf"]:not(.wavebox-pdf-iframe-preview-enabled)')
      Array.from(frames).forEach((frame) => this._renderWaveboxPDFPreview(frame))
    })

    ipcRenderer.on(WCRPC_DOM_READY, () => {
      this.pdfObserver.observe(document.body, { childList: true, subtree: true })
    })
  }

  /**
  * Render the wavebox pdf frame
  * @param iframe: the iframe element that has been added to the dom
  */
  _renderWaveboxPDFPreview = (iframe) => {
    const src = iframe.getAttribute('src')
    const autoOpen = window.localStorage['wavebox_auto_open_pdf_preview'] === 'true'

    // Create the preview element
    const preview = document.createElement('div')
    preview.className = 'wavebox-pdf-preview-pane'
    preview.innerHTML = `
      <div class="wavebox-pdf-icon"></div>
      <div class="wavebox-pdf-button">Preview PDF</div>
      <label class="wavebox-pdf-auto-open-setting" data-setting="auto-open">
        <input type="checkbox" ${autoOpen ? 'checked' : ''}>
        Automatically open PDF previews
      </label>
    `
    preview.addEventListener('click', (evt) => {
      const setting = (() => {
        const targetSett = evt.target.getAttribute('data-setting')
        if (targetSett) { return targetSett }

        const parentEl = evt.target.closest('[data-setting]')
        if (parentEl) {
          const parentSett = parentEl.getAttribute('data-setting')
          if (parentSett) { return parentSett }
        }

        return undefined
      })()

      if (setting) {
        if (setting === 'auto-open') {
          evt.stopPropagation()
          window.localStorage['wavebox_auto_open_pdf_preview'] = preview.querySelector('.wavebox-pdf-auto-open-setting input[type="checkbox"]').checked
        } else {
          evt.stopPropagation()
          evt.preventDefault()
        }
      } else {
        evt.stopPropagation()
        evt.preventDefault()
        window.open(src, '_blank', `width=${preview.offsetWidth}px,height=${preview.offsetHeight}px`)
      }
    }, true)
    iframe.parentElement.appendChild(preview)

    // Update the frame
    iframe.classList.add('wavebox-pdf-iframe-preview-enabled')

    // Auto-open
    if (autoOpen) {
      setTimeout(() => {
        window.open(src, '_blank', `width=${preview.offsetWidth}px,height=${preview.offsetHeight}px`)
      })
    }
  }
}

export default TrelloAdaptor
