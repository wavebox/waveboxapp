import fs from 'fs'
import pdfjsLib from './PDFJS'

class PDFDatasource {
  /**
  * Loads a PDF from a local path
  * @param localPath: the path to the pdf
  * @return promise
  */
  static loadPDF (localPath) {
    return Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          fs.readFile(localPath, (err, data) => {
            if (err) {
              reject(err)
            } else {
              resolve(new Uint8Array(data))
            }
          })
        })
      })
      .then((pdfData) => pdfjsLib.getDocument(pdfData))
  }

  /**
  * Gets all the pages in the pdf document
  * @param pdfDocument: the pdfDocument
  * @return promise with a list of pages
  */
  static getAllPages (pdfDocument) {
    const pageNumbers = []
    for (let pageNum = 0; pageNum < pdfDocument.numPages; pageNum++) {
      pageNumbers.push(pageNum + 1)
    }

    return pageNumbers.reduce((acc, pageNum) => {
      return acc.then((pagesAcc) => {
        return pdfDocument.getPage(pageNum).then((page) => pagesAcc.concat([page]))
      })
    }, Promise.resolve([]))
  }
}

export default PDFDatasource
