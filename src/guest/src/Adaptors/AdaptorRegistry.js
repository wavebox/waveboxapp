import AsanaAdaptor from './Sites/AsanaAdaptor'
import GmailGinboxAdaptor from './Sites/GmailGinboxAdaptor'
import GoogleAlloAdaptor from './Sites/GoogleAlloAdaptor'
import GoogleCalendarAdaptor from './Sites/GoogleCalendarAdaptor'
import GoogleDriveAdaptor from './Sites/GoogleDriveAdaptor'
import GoogleHangoutsAdaptor from './Sites/GoogleHangoutsAdaptor'
import HostedExtensionAdaptor from './Sites/HostedExtensionAdaptor'
import OneDriveAdaptor from './Sites/OneDriveAdaptor'
import SlackAdaptor from './Sites/SlackAdaptor'
import TwitterAdaptor from './Sites/TwitterAdaptor'

const registry = [
  AsanaAdaptor,
  GmailGinboxAdaptor,
  GoogleAlloAdaptor,
  GoogleCalendarAdaptor,
  GoogleDriveAdaptor,
  GoogleHangoutsAdaptor,
  HostedExtensionAdaptor,
  OneDriveAdaptor,
  SlackAdaptor,
  TwitterAdaptor
]

export default registry
