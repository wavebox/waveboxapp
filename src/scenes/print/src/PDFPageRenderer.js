class PDFPageRenderer {
  /**
  * Renders a page a canvas element
  * @param pdfPage: the page to render
  * @param config: object with the following properties
  *            @param printResolution=150: the print resolution to use when generating
  *           @param printDpi=72: the dpi to print at
  *           @param screenDpi=96: the screen dpi to render at
  * @return promise { canvas, screenSize: { width, height }, printSize: { width, height } }
  */
  static renderToPrintCanvas (pdfPage, config) {
    config = {
      ...config,
      printResolution: 150,
      printDpi: 72,
      screenDpi: 96
    }

    const pageSize = pdfPage.getViewport(1)

    // Calculate the size to render and print
    const printUnits = config.printResolution / config.printDpi
    const printSize = {
      width: Math.floor(pageSize.width * printUnits),
      height: Math.floor(pageSize.height * printUnits)
    }

    const screenUnits = config.screenDpi / config.printDpi
    const screenSize = {
      width: Math.floor(pageSize.width * screenUnits),
      height: Math.floor(pageSize.height * screenUnits)
    }

    // Prep the canvas
    const canvas = document.createElement('canvas')
    canvas.width = printSize.width
    canvas.height = printSize.height
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.fillStyle = 'rgb(255, 255, 255)'
    ctx.fillRect(0, 0, printSize.width, printSize.height)
    ctx.restore()

    // Render to the canvas
    return Promise.resolve()
      .then(() => {
        const renderContext = {
          canvasContext: ctx,
          transform: [printUnits, 0, 0, printUnits, 0, 0],
          viewport: pdfPage.getViewport(1, pageSize.rotation),
          intent: 'print'
        }
        return pdfPage.render(renderContext)
      })
      .then(() => {
        return {
          canvas: canvas,
          printSize: printSize,
          screenSize: screenSize
        }
      })
  }

  /**
  * Renders a page to a DOM image
  * @param pdfPage: the page to render
  * @param config: the config object to pass to renderToCanvas
  * @return promise { image, canvas, url, screenSize: { width, height }, printSize: { width, height } }
  */
  static renderToPrintDOMImage (pdfPage, config) {
    return Promise.resolve()
      .then(() => this.renderToPrintCanvas(pdfPage, config))
      .then((params) => {
        return new Promise((resolve, reject) => {
          params.canvas.toBlob((data) => {
            resolve({ ...params, url: window.URL.createObjectURL(data) })
          })
        })
      })
      .then((params) => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img')
          img.width = params.screenSize.width
          img.height = params.screenSize.height
          img.onload = () => {
            resolve({...params, image: img})
          }
          img.onerror = (err) => {
            reject(err)
          }
          img.src = params.url
        })
      })
  }
}

export default PDFPageRenderer
