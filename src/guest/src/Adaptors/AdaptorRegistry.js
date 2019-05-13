import AirtableAdaptor from './Sites/AirtableAdaptor'
import AsanaAdaptor from './Sites/AsanaAdaptor'
import GmailAdaptor from './Sites/GmailAdaptor'
import GoogleAlloAdaptor from './Sites/GoogleAlloAdaptor'
import GoogleDriveAdaptor from './Sites/GoogleDriveAdaptor'
import GoogleHangoutsAdaptor from './Sites/GoogleHangoutsAdaptor'
import OneDriveAdaptor from './Sites/OneDriveAdaptor'
import SlackAdaptor from './Sites/SlackAdaptor'
import TrelloAdaptor from './Sites/TrelloAdaptor'

const registry = [
  AirtableAdaptor,
  AsanaAdaptor,
  GmailAdaptor,
  GoogleAlloAdaptor,
  GoogleDriveAdaptor,
  GoogleHangoutsAdaptor,
  OneDriveAdaptor,
  SlackAdaptor,
  TrelloAdaptor
]

export default registry
