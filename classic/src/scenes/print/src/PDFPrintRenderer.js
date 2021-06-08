import PDFDatasource from './PDFDatasource'
import PDFPageRenderer from './PDFPageRenderer'
import uuid from 'uuid'

class PDFPrintRenderer {
  /**
  * Renders a PDF for print
  * @param container: the dom container to render into
  * @param pdfDocument: the pdf document
  * @param progressCallback=undefined: optional callback to receive progress. Provided with a progress between 0 and 1
  */
  static renderForPrint (container, pdfDocument, progressCallback = undefined) {
    container.innerHTML = ''
    const renderId = uuid.v4()
    const renderClassName = `print-render-${renderId}`

    if (progressCallback) { progressCallback(0) }
    return Promise.resolve()
      .then(() => PDFDatasource.getAllPages(pdfDocument))
      .then((pages) => {
        return pages.reduce((acc, page, index) => {
          return acc
            .then((pageInfoAcc) => {
              return PDFPageRenderer.renderToPrintDOMImage(page)
                .then((render) => Promise.resolve({ pageInfoAcc, render }))
            })
            .then(({ pageInfoAcc, render }) => {
              const pageContainer = document.createElement('div')
              pageContainer.className = renderClassName
              pageContainer.appendChild(render.image)
              container.appendChild(pageContainer)
              if (progressCallback) { progressCallback((index + 1) / pages.length) }
              return pageInfoAcc.concat([render.screenSize])
            })
        }, Promise.resolve([]))
      })
      .then((renderedSizes) => {
        const size = this._calculateCommonPageSize(renderedSizes)
        const orientation = this._calculateOrientation(size.width, size.height)
        const style = document.createElement('style')
        style.innerHTML = `
          .${renderClassName} {
            width: ${size.width}px;
            height: ${size.height}px;
            page-break-after: always;
            page-break-inside: avoid;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }
          @media print {
            @page {
              size: ${size.width}px ${size.height}px ${orientation};
              margin-top: 0px;
              margin-left: 0px;
              margin-right: 0px;
              margin-bottom:-1px;
            }
          }
        `
        document.head.appendChild(style)
        return Promise.resolve()
      })
  }

  /**
  * Works out the common page size for a set of page sizes
  * @param pageSize: a list of page sizes in the format [ { width, height } ]
  * @return the common page size or in the case of a conflict a consistent page size { width, height }
  */
  static _calculateCommonPageSize (pageSizes) {
    const unhash = new Map()
    const count = new Map()

    pageSizes.forEach((size) => {
      const hash = `${size.width}:${size.height}`
      unhash.set(hash, size)
      count.set(hash, (count.get(hash) || 0) + 1)
    })

    const common = Array.from(count.entries()).reduce((acc, [hash, count]) => {
      if (count === acc.count) {
        acc.conflict = true
        return acc
      } else if (count > acc.count) {
        acc.conflict = false
        acc.hash = hash
        acc.count = count
        return acc
      } else {
        return acc
      }
    }, { conflict: false, hash: undefined, count: 0 })

    if (common.conflict || common.hash === undefined) {
      return pageSizes[0]
    } else {
      return unhash.get(common.hash)
    }
  }

  /**
  * @param width: the page width
  * @param height: the page height
  * @return portrait or landscape
  */
  static _calculateOrientation (width, height) {
    if (width > height) {
      return 'landscape'
    } else {
      return 'portrait'
    }
  }
}

export default PDFPrintRenderer
