import SpellcheckService from './SpellcheckService'
import PDFRenderService from './PDFRenderService'
import MetricsService from './MetricsService'
import ContextMenuService from './ContextMenuService'
import WebContentsRPCService from './WebContentsRPCService'

const privLoaded = Symbol('privLoaded')
const privSpellcheckService = Symbol('privSpellcheckService')
const privMetricsService = Symbol('privMetricsService')
const privPdfRenderService = Symbol('privPdfRenderService')
const privContextMenuService = Symbol('privContextMenuService')
const privWebContentsRPCService = Symbol('privWebContentsRPCService')

class ServicesManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privLoaded] = false

    this[privSpellcheckService] = undefined
    this[privContextMenuService] = undefined
    this[privMetricsService] = undefined
    this[privPdfRenderService] = undefined
    this[privWebContentsRPCService] = undefined
  }

  load () {
    if (this[privLoaded]) { return }
    this[privLoaded] = true

    this[privSpellcheckService] = new SpellcheckService()
    this[privContextMenuService] = new ContextMenuService(this[privSpellcheckService])
    this[privMetricsService] = new MetricsService()
    this[privPdfRenderService] = new PDFRenderService()
    this[privWebContentsRPCService] = new WebContentsRPCService()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get metricsService () { return this[privMetricsService] }
  get PDFRenderService () { return this[privPdfRenderService] }
  get spellcheckService () { return this[privSpellcheckService] }
  get contextMenuService () { return this[privContextMenuService] }
  get webContentsRPCService () { return this[privWebContentsRPCService] }
}

export default new ServicesManager()
