import { app, BrowserWindow, dialog } from 'electron'
import { CHROME_PDF_URL } from 'shared/constants'
import { DownloadManager } from 'Download'
import Resolver from 'Runtime/Resolver'
import fs from 'fs-extra'
import url from 'url'

class PDFRenderService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    app.on('web-contents-created', this._handleWebContentsCreated)
  }

  load () { /* no-op */ }

  /* ****************************************************************************/
  // Event listeners
  /* ****************************************************************************/

  /**
  * Handles a new web contents being created
  * @param evt: the event that fired
  * @param wc: the web contents that were created
  */
  _handleWebContentsCreated = (evt, wc) => {
    wc.on('did-navigate', this._handleWebContentsNavigated)
    wc.on('dom-ready', this._handleWebContentsDomReady)
    wc.on('page-title-updated', this._handleWebContentsTitleUpdated)
  }

  /**
  * Handles a web contents navigating
  * @param evt: the event that fired
  * @param url: the url navigated to
  */
  _handleWebContentsNavigated = (evt, targetUrl) => {
    if (!targetUrl.startsWith(CHROME_PDF_URL)) { return }

    const pdfUrl = url.parse(targetUrl, true).query.src
    if (url.parse(pdfUrl, true).query.print === 'true') {
      Promise.resolve()
        .then(() => this._printPdf(evt.sender, pdfUrl))
        .catch(() => dialog.showErrorBox('Printing error', 'Failed to print'))
    }
  }

  /**
  * Handles a webcontents dom being ready
  * @param evt: the event that fired
  */
  _handleWebContentsDomReady = (evt) => {
    if (!evt.sender.getURL().startsWith(CHROME_PDF_URL)) { return }
    this._injectPrintButton(evt.sender)
  }

  /**
  * Handles the title being updated
  * @param evt: the event that fired
  * @param title: the new title
  */
  _handleWebContentsTitleUpdated = (evt, title) => {
    if (!evt.sender.getURL().startsWith(CHROME_PDF_URL)) { return }

    if (title === 'wbaction:print') {
      evt.sender.executeJavaScript(`document.title = 'PDF'`)
      const pdfUrl = url.parse(evt.sender.getURL(), true).query.src
      Promise.resolve()
        .then(() => this._printPdf(evt.sender, pdfUrl))
        .catch(() => dialog.showErrorBox('Printing error', 'Failed to print'))
    }
  }

  /* ****************************************************************************/
  // Injectors
  /* ****************************************************************************/

  /**
  * Injects the print button
  * @param wc: the webcontents to inject to
  */
  _injectPrintButton (wc) {
    wc.executeJavaScript(`
      ;(function () {
        const printButton = document.createElement('paper-icon-button')
        printButton.id = 'print'
        printButton.setAttribute('icon', 'cr:print')
        printButton.setAttribute('aria-label', 'Print')
        printButton.setAttribute('title', 'Print')
        printButton.addEventListener('click', () => {
          document.title = 'wbaction:print'
        })
        const toolbar = document.querySelector('#toolbar').shadowRoot
        const downloadButton = toolbar.querySelector('#download')
        downloadButton.parentElement.insertBefore(printButton, downloadButton.nextSibling)
      })()
    `)
  }

  /* ****************************************************************************/
  // Printing
  /* ****************************************************************************/

  /**
  * Prints a with the UI to go with it
  * @param sourceWebContents: the web contents that's trying to download
  * @param url: the url of the pdf
  * @return promise on completion
  */
  _printPdf (sourceWebContents, url) {
    return new Promise((resolve, reject) => {
      let tmpDownloadPath
      const parentWindow = BrowserWindow.fromWebContents(sourceWebContents.hostWebContents ? sourceWebContents.hostWebContents : sourceWebContents)
      const window = new BrowserWindow({
        width: 400,
        height: 200,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        parent: parentWindow,
        modal: true,
        show: false,
        webPreferences: {
          nodeIntegration: true
        }
      })

      window.once('ready-to-show', () => { window.show() })
      window.on('page-title-updated', (evt, title) => {
        if (title.startsWith('wbaction:')) {
          evt.preventDefault()

          if (title === 'wbaction:complete' || title === 'wbaction:error') {
            window.close()
            if (tmpDownloadPath) {
              try { fs.removeSync(tmpDownloadPath) } catch (ex) { }
            }

            if (title === 'wbaction:complete') {
              resolve()
            } else if (title === 'wbaction:error') {
              reject(new Error('Printing Error'))
            }
          }
        }
      })
      window.loadURL(`file://${Resolver.printScene('index.html')}`)
      window.webContents.once('dom-ready', () => {
        DownloadManager.startPlatformDownloadToTemp(sourceWebContents, url)
          .then((localPath) => {
            tmpDownloadPath = localPath
            window.webContents.executeJavaScript(`window.printPDF("${localPath}")`)
          })
          .catch((err) => {
            window.close()
            reject(err)
          })
      })
    })
  }
}

export default PDFRenderService
