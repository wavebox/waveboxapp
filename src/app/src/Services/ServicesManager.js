import SpellcheckService from './SpellcheckService'
import PDFRenderService from './PDFRenderService'
import MetricsService from './MetricsService'
import ContextMenuService from './ContextMenuService'
import WebContentsRPCService from './WebContentsRPCService'
import MailboxAdaptorService from './MailboxAdaptorService'
import WBGApiService from './WBGApiService'
import AutofillService from './AutofillService'
import NotificationService from './NotificationService'
import FetchService from './FetchService'
import TakeoutService from './TakeoutService'

const privLoaded = Symbol('privLoaded')
const privSpellcheckService = Symbol('privSpellcheckService')
const privMetricsService = Symbol('privMetricsService')
const privPdfRenderService = Symbol('privPdfRenderService')
const privContextMenuService = Symbol('privContextMenuService')
const privWebContentsRPCService = Symbol('privWebContentsRPCService')
const privMailboxAdaptorService = Symbol('privMailboxAdaptorService')
const privWBGApiService = Symbol('privWBGApiService')
const privAutofillService = Symbol('privAutofillService')
const privNotificationService = Symbol('privNotificationService')
const privFetchService = Symbol('privFetchService')
const privTakeoutService = Symbol('privTakeoutService')

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
    this[privWBGApiService] = undefined
    this[privNotificationService] = undefined
    this[privFetchService] = undefined
    this[privTakeoutService] = undefined
  }

  load () {
    if (this[privLoaded]) { return }
    this[privLoaded] = true

    this[privSpellcheckService] = new SpellcheckService()
    this[privAutofillService] = new AutofillService()
    this[privContextMenuService] = new ContextMenuService(this[privSpellcheckService], this[privAutofillService])
    this[privNotificationService] = new NotificationService()
    this[privMetricsService] = new MetricsService()
    this[privPdfRenderService] = new PDFRenderService()
    this[privWebContentsRPCService] = new WebContentsRPCService(this[privNotificationService])
    this[privMailboxAdaptorService] = new MailboxAdaptorService()
    this[privWBGApiService] = new WBGApiService()
    this[privFetchService] = new FetchService()
    this[privTakeoutService] = new TakeoutService()
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
  get wbgapiService () { return this[privWBGApiService] }
  get notificationService () { return this[privNotificationService] }
  get fetchService () { return this[privFetchService] }
  get takeoutService () { return this[privTakeoutService] }
}

export default new ServicesManager()
