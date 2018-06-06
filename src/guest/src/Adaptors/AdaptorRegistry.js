import AsanaAdaptor from './Sites/AsanaAdaptor'
import GmailGinboxAdaptor from './Sites/GmailGinboxAdaptor'
import GoogleAlloAdaptor from './Sites/GoogleAlloAdaptor'
import GoogleChatAdaptor from './Sites/GoogleChatAdaptor'
import GoogleDriveAdaptor from './Sites/GoogleDriveAdaptor'
import GoogleHangoutsAdaptor from './Sites/GoogleHangoutsAdaptor'
import OneDriveAdaptor from './Sites/OneDriveAdaptor'
import SlackAdaptor from './Sites/SlackAdaptor'
import TrelloAdaptor from './Sites/TrelloAdaptor'

const registry = [
  AsanaAdaptor,
  GmailGinboxAdaptor,
  GoogleAlloAdaptor,
  GoogleChatAdaptor,
  GoogleDriveAdaptor,
  GoogleHangoutsAdaptor,
  OneDriveAdaptor,
  SlackAdaptor,
  TrelloAdaptor
]

export default registry
