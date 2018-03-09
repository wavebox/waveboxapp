import AsanaAdaptor from './Sites/AsanaAdaptor'
import GmailGinboxAdaptor from './Sites/GmailGinboxAdaptor'
import GoogleAlloAdaptor from './Sites/GoogleAlloAdaptor'
import GoogleDriveAdaptor from './Sites/GoogleDriveAdaptor'
import GoogleHangoutsAdaptor from './Sites/GoogleHangoutsAdaptor'
import OneDriveAdaptor from './Sites/OneDriveAdaptor'
import SlackAdaptor from './Sites/SlackAdaptor'
import TwitterAdaptor from './Sites/TwitterAdaptor'

const registry = [
  AsanaAdaptor,
  GmailGinboxAdaptor,
  GoogleAlloAdaptor,
  GoogleDriveAdaptor,
  GoogleHangoutsAdaptor,
  OneDriveAdaptor,
  SlackAdaptor,
  TwitterAdaptor
]

export default registry
