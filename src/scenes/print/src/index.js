import './index.less'
import PDFDatasource from './PDFDatasource'
import PDFPrintRenderer from './PDFPrintRenderer'
import ProgressUI from './ProgressUI'
import electron from 'electron'

const progressUI = new ProgressUI(document.getElementById('progress'))
progressUI.isIndeterminate = true
progressUI.status = 'Downloading...'
progressUI.showCancel = true

window.printPDFEncoded = function (encodedLocalPath) {
  window.printPDF(decodeURIComponent(encodedLocalPath))
}

window.printPDF = function (localPath) {
  Promise.resolve()
    .then(() => PDFDatasource.loadPDF(localPath))
    .then((pdfDocument) => {
      progressUI.percentage = 0
      progressUI.isIndeterminate = false
      progressUI.status = 'Drawing...'
      return Promise.resolve(pdfDocument)
    })
    .then((pdfDocument) => PDFPrintRenderer.renderForPrint(document.getElementById('print-renderer'), pdfDocument, (p) => { progressUI.percentage = p }))
    .then(() => {
      progressUI.percentage = 0
      progressUI.isIndeterminate = true
      progressUI.status = 'Printing...'
      progressUI.showCancel = false
      document.title = 'wbaction:print'
      return new Promise((resolve) => {
        setTimeout(resolve, 500) // Let the DOM catch up
      })
    })
    .then(() => {
      window.print()
    })
    .then(() => {
      if (process.platform === 'win32') {
        const browserWindow = electron.remote.getCurrentWindow()
        let spoolWait = null
        browserWindow.on('focus', () => {
          clearTimeout(spoolWait)
          spoolWait = setTimeout(() => {
            document.title = 'wbaction:complete'
          }, 2000)
        })
        browserWindow.on('blur', () => {
          clearTimeout(spoolWait)
        })
      } else {
        document.title = 'wbaction:complete'
      }
    })
    .catch((e) => {
      document.title = 'wbaction:error'
    })
}
