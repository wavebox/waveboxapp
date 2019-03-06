import SpellcheckService from './SpellcheckService'
import PDFRenderService from './PDFRenderService'
import MetricsService from './MetricsService'
import ContextMenuService from './ContextMenuService'
import WBRPCService from './WBRPCService'
import MailboxAdaptorService from './MailboxAdaptorService'
import WBAPIService from './WBAPIService'
import AutofillService from './AutofillService'
import NotificationService from './NotificationService'
import FetchService from './FetchService'
import TakeoutService from './TakeoutService'
import RecentTrackerService from './RecentTrackerService'
import PowerMonitorService from './PowerMonitorService'

const privLoaded = Symbol('privLoaded')
const privSpellcheckService = Symbol('privSpellcheckService')
const privMetricsService = Symbol('privMetricsService')
const privPdfRenderService = Symbol('privPdfRenderService')
const privContextMenuService = Symbol('privContextMenuService')
const privWBRPCService = Symbol('privWBRPCService')
const privMailboxAdaptorService = Symbol('privMailboxAdaptorService')
const privWBAPIService = Symbol('privWBAPIService')
const privAutofillService = Symbol('privAutofillService')
const privNotificationService = Symbol('privNotificationService')
const privFetchService = Symbol('privFetchService')
const privTakeoutService = Symbol('privTakeoutService')
const privRecentTrackerService = Symbol('privRecentTrackerService')
const privPowerMonitorService = Symbol('privPowerMonitorService')

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
    this[privWBRPCService] = undefined
    this[privMailboxAdaptorService] = undefined
    this[privWBAPIService] = undefined
    this[privNotificationService] = undefined
    this[privFetchService] = undefined
    this[privTakeoutService] = undefined
    this[privRecentTrackerService] = undefined
    this[privPowerMonitorService] = undefined
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
    this[privWBRPCService] = new WBRPCService(this[privNotificationService])
    this[privMailboxAdaptorService] = new MailboxAdaptorService()
    this[privWBAPIService] = new WBAPIService()
    this[privFetchService] = new FetchService()
    this[privTakeoutService] = new TakeoutService()
    this[privRecentTrackerService] = new RecentTrackerService()
    this[privPowerMonitorService] = new PowerMonitorService()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get metricsService () { return this[privMetricsService] }
  get PDFRenderService () { return this[privPdfRenderService] }
  get spellcheckService () { return this[privSpellcheckService] }
  get autofillService () { return this[privAutofillService] }
  get contextMenuService () { return this[privContextMenuService] }
  get waveboxRPCService () { return this[privWBRPCService] }
  get mailboxAdaptorService () { return this[privMailboxAdaptorService] }
  get waveboxAPIService () { return this[privWBAPIService] }
  get notificationService () { return this[privNotificationService] }
  get fetchService () { return this[privFetchService] }
  get takeoutService () { return this[privTakeoutService] }
  get recentTrackerService () { return this[privRecentTrackerService] }
  get powerMonitorService () { return this[privPowerMonitorService] }
}

export default new ServicesManager()
