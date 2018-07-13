import { app, BrowserWindow, dialog } from 'electron'
import { CHROME_PDF_URL } from 'shared/constants'
import { DownloadManager } from 'Download'
import Resolver from 'Runtime/Resolver'
import fs from 'fs-extra'
import { URL } from 'url'

class PDFRenderService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    app.on('web-contents-created', this._handleWebContentsCreated)
  }

  /* ****************************************************************************/
  // Event listeners
  /* ****************************************************************************/

  /**
  * Handles a new web contents being created
  * @param evt: the event that fired
  * @param wc: the web contents that were created
  */
  _handleWebContentsCreated = (evt, wc) => {
    wc.on('dom-ready', this._handleWebContentsDomReady)
    wc.on('page-title-updated', this._handleWebContentsTitleUpdated)
  }

  /**
  * Handles a webcontents dom being ready
  * @param evt: the event that fired
  */
  _handleWebContentsDomReady = (evt) => {
    const targetUrl = evt.sender.getURL()
    if (!targetUrl.startsWith(CHROME_PDF_URL)) { return }
    this._injectPrintButton(evt.sender)

    // Look to see if we should print. Really this should be under did-navigate
    // but if a new window is a launched the modal popup can appear to early in
    // the window lifecycle which causes a visual glitch. Running on dom-ready
    // has negligable delay but makes sure everyone is setup correctly
    const pdfUrl = new URL(targetUrl).searchParams.get('src')
    if (new URL(pdfUrl).searchParams.get('print') === 'true') {
      Promise.resolve()
        .then(() => this._printPdf(evt.sender, pdfUrl))
        .catch((err) => {
          if (err.message.toString().toLowerCase().indexOf('user') === -1) {
            dialog.showErrorBox('Printing error', 'Failed to print')
          }
        })
    }
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
      const pdfUrl = new URL(evt.sender.getURL()).searchParams.get('src')
      Promise.resolve()
        .then(() => this._printPdf(evt.sender, pdfUrl))
        .catch((err) => {
          if (err.message.toString().toLowerCase().indexOf('user') === -1) {
            dialog.showErrorBox('Printing error', 'Failed to print')
          }
        })
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
  * Gets the parent window config for the print dialog
  * @param sourceWebContents: the web contents that's trying to download
  * @param width=400: the width of the modal window
  * @param height=200: the height of the modal window
  * @return { ... } properties for the browser window that's being created
  */
  _pdfPrintWindowProperties (sourceWebContents, width = 400, height = 200) {
    const parentWindow = BrowserWindow.fromWebContents(sourceWebContents.hostWebContents ? sourceWebContents.hostWebContents : sourceWebContents)

    const standard = {
      width: width,
      height: height,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      modal: true,
      show: true,
      webPreferences: {
        nodeIntegration: true,
        backgroundThrottling: false,
        nodeIntegrationInWorker: false,
        webviewTag: false
      }
    }

    if (parentWindow) {
      const [parentWidth] = parentWindow.getSize()
      const [parentX, parentY] = parentWindow.getPosition()
      const x = parentX + ((parentWidth - width) / 2)
      const y = parentY

      return {
        ...standard,
        x: x,
        y: y,
        parent: parentWindow
      }
    } else {
      return {
        ...standard,
        alwaysOnTop: true
      }
    }
  }

  /**
  * Cleans up the pdf print
  * @param downloadPath: the download path of the file
  * @param window: the print window
  */
  _pdfPrintCleanup (downloadPath, window) {
    window.removeAllListeners('closed')
    window.destroy()
    if (downloadPath) {
      try { fs.removeSync(downloadPath) } catch (ex) { }
    }
  }

  /**
  * Prints a with the UI to go with it
  * @param sourceWebContents: the web contents that's trying to download
  * @param url: the url of the pdf
  * @return promise on completion
  */
  _printPdf (sourceWebContents, url) {
    return new Promise((resolve, reject) => {
      let tmpDownloadPath

      const window = new BrowserWindow(this._pdfPrintWindowProperties(sourceWebContents))
      window.setMenuBarVisibility(false)
      window.on('closed', () => { reject(new Error('User closed window')) })
      window.on('page-title-updated', (evt, title) => {
        if (title.startsWith('wbaction:')) {
          evt.preventDefault()

          if (title === 'wbaction:print') {
            window.webContents.print({ silent: false, printBackground: false, deviceName: '' }, (success) => {
              this._pdfPrintCleanup(tmpDownloadPath, window)
              if (success) {
                resolve()
              } else {
                reject(new Error('Printing Error'))
              }
            })
          } else if (title === 'wbaction:error') {
            this._pdfPrintCleanup(tmpDownloadPath, window)
            reject(new Error('Printing Error'))
          } else if (title === 'wbaction:cancel') {
            this._pdfPrintCleanup(tmpDownloadPath, window)
            reject(new Error('User cancelled'))
          }
        }
      })
      window.loadURL(`file://${Resolver.printScene('index.html')}`)
      window.webContents.on('will-navigate', (evt, nextUrl) => evt.preventDefault())
      window.webContents.once('dom-ready', () => {
        DownloadManager.startPlatformDownloadToTemp(sourceWebContents, url)
          .then((localPath) => {
            tmpDownloadPath = localPath
            window.webContents.executeJavaScript(`window.printPDFEncoded("${encodeURIComponent(localPath)}")`)
          })
          .catch((err) => {
            window.removeAllListeners('closed')
            window.destroy()
            reject(err)
          })
      })
    })
  }
}

export default PDFRenderService
