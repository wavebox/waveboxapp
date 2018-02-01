import SpellcheckService from './SpellcheckService'
import PDFRenderService from './PDFRenderService'
import MetricsService from './MetricsService'
import ContextMenuService from './ContextMenuService'
import WebContentsRPCService from './WebContentsRPCService'
import MailboxAdaptorService from './MailboxAdaptorService'
import GuestApiService from './GuestApiService'
import AutofillService from './AutofillService'

const privLoaded = Symbol('privLoaded')
const privSpellcheckService = Symbol('privSpellcheckService')
const privMetricsService = Symbol('privMetricsService')
const privPdfRenderService = Symbol('privPdfRenderService')
const privContextMenuService = Symbol('privContextMenuService')
const privWebContentsRPCService = Symbol('privWebContentsRPCService')
const privMailboxAdaptorService = Symbol('privMailboxAdaptorService')
const privGuestApiService = Symbol('privGuestApiService')
const privAutofillService = Symbol('privAutofillService')

class ServicesManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privLoaded] = false

    this[privSpellcheckService] = undefined
    this[privAutofillService] = undefined
    this[privContextMenuService] = undefined
    this[privMetricsService] = undefined
    this[privPdfRenderService] = undefined
    this[privWebContentsRPCService] = undefined
    this[privMailboxAdaptorService] = undefined
    this[privGuestApiService] = undefined
  }

  load () {
    if (this[privLoaded]) { return }
    this[privLoaded] = true

    this[privSpellcheckService] = new SpellcheckService()
    this[privAutofillService] = new AutofillService()
    this[privContextMenuService] = new ContextMenuService(this[privSpellcheckService], this[privAutofillService])
    this[privMetricsService] = new MetricsService()
    this[privPdfRenderService] = new PDFRenderService()
    this[privWebContentsRPCService] = new WebContentsRPCService()
    this[privMailboxAdaptorService] = new MailboxAdaptorService()
    this[privGuestApiService] = new GuestApiService()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get metricsService () { return this[privMetricsService] }
  get PDFRenderService () { return this[privPdfRenderService] }
  get spellcheckService () { return this[privSpellcheckService] }
  get autofillService () { return this[privAutofillService] }
  get contextMenuService () { return this[privContextMenuService] }
  get webContentsRPCService () { return this[privWebContentsRPCService] }
  get mailboxAdaptorService () { return this[privMailboxAdaptorService] }
  get guestApiService () { return this[privGuestApiService] }
}

export default new ServicesManager()
