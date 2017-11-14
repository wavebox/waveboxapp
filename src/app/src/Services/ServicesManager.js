import SpellcheckService from './SpellcheckService'
import PDFRenderService from './PDFRenderService'
import MetricsService from './MetricsService'

class ServicesManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this._loaded = false

    this._metricsService = undefined
    this._pdfRenderService = undefined
    this._spellcheckService = undefined
  }

  load () {
    if (this._loaded) { return }
    this._loaded = true

    this._metricsService = new MetricsService()
    this._pdfRenderService = new PDFRenderService()
    this._spellcheckService = new SpellcheckService()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get metricsService () { return this._metricsService }
  get PDFRenderService () { return this._pdfRenderService }
  get SpellcheckService () { return this._spellcheckService }
}

export default new ServicesManager()
